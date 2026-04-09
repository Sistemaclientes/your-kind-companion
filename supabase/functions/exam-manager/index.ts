import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-action, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get user
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user } } = await userClient.auth.getUser();

    const body = await req.json().catch(() => ({}));
    const action = req.headers.get("x-action") || body.action || "start";

    // ===== START EXAM =====
    if (action === "start") {
      if (!user) return jsonResp({ error: "Autenticação necessária" }, 401);

      const { exam_id, device_info } = body;
      if (!exam_id) return jsonResp({ error: "exam_id obrigatório" }, 400);

      // Expire any existing in_progress attempts for this user/exam
      const { data: existingAttempts } = await supabase
        .from("exam_attempts")
        .select("id")
        .eq("user_id", user.id)
        .eq("exam_id", exam_id)
        .eq("status", "in_progress");

      if (existingAttempts && existingAttempts.length > 0) {
        for (const old of existingAttempts) {
          await supabase.from("exam_attempts").update({ status: "expired" }).eq("id", old.id);
        }
      }

      // Check if user already passed this exam (via resultados table)
      const { data: passedResults } = await supabase
        .from("resultados")
        .select("id, pontuacao")
        .eq("aluno_id", user.id)
        .eq("prova_id", exam_id);

      const hasPassed = (passedResults || []).some((r: any) => r.pontuacao >= 70);
      if (hasPassed) {
        return jsonResp({ error: "Você já foi aprovado nesta prova e não pode refazê-la" }, 403);
      }

      const { data: exam } = await supabase.from("provas").select("duracao, tentativas_permitidas").eq("id", exam_id).single();
      if (!exam) return jsonResp({ error: "Prova não encontrada" }, 404);

      const durationMinutes = exam.duracao || 60;
      const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
      const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";

      const { data: attempt, error: insertError } = await supabase
        .from("exam_attempts")
        .insert({ user_id: user.id, exam_id, expires_at: expiresAt, device_info: device_info || {}, ip_address: ip })
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        return jsonResp({ error: "Erro ao iniciar prova" }, 500);
      }

      return jsonResp({ attempt, remaining_seconds: durationMinutes * 60 });
    }

    // ===== SYNC TIME =====
    if (action === "sync-time") {
      if (!user) return jsonResp({ error: "Auth required" }, 401);
      const { attempt_id } = body;
      if (!attempt_id) return jsonResp({ error: "attempt_id required" }, 400);

      const { data: attempt } = await supabase
        .from("exam_attempts").select("*").eq("id", attempt_id).eq("user_id", user.id).single();
      if (!attempt) return jsonResp({ error: "Not found" }, 404);

      if (attempt.status !== "in_progress") return jsonResp({ remaining_seconds: 0, status: attempt.status });

      const remaining = Math.max(0, Math.floor((new Date(attempt.expires_at).getTime() - Date.now()) / 1000));
      if (remaining <= 0) {
        await supabase.from("exam_attempts").update({ status: "expired" }).eq("id", attempt_id);
        return jsonResp({ remaining_seconds: 0, status: "expired" });
      }
      return jsonResp({ remaining_seconds: remaining, status: "in_progress", violations: attempt.violations });
    }

    // ===== FINISH =====
    if (action === "finish") {
      if (!user) return jsonResp({ error: "Auth required" }, 401);
      const { attempt_id } = body;
      await supabase.from("exam_attempts").update({ status: "completed" }).eq("id", attempt_id).eq("user_id", user.id);
      return jsonResp({ success: true });
    }

    // ===== TERMINATE =====
    if (action === "terminate") {
      if (!user) return jsonResp({ error: "Auth required" }, 401);
      const { attempt_id, reason } = body;
      await supabase.from("exam_attempts").update({ status: "terminated" }).eq("id", attempt_id);
      await supabase.from("violations_log").insert({ attempt_id, type: "exam_terminated", metadata: { reason: reason || "max_violations" } });
      return jsonResp({ success: true });
    }

    // ===== ANALYZE (AI) =====
    if (action === "analyze") {
      if (!user) return jsonResp({ error: "Auth required" }, 401);
      const { attempt_id } = body;
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) return jsonResp({ analyzed: 0 });

      const { data: logs } = await supabase
        .from("proctoring_logs").select("*").eq("attempt_id", attempt_id).eq("ai_flag", "pending").order("timestamp", { ascending: false }).limit(5);
      if (!logs || logs.length === 0) return jsonResp({ analyzed: 0 });

      const { data: violations } = await supabase
        .from("violations_log").select("type, timestamp").eq("attempt_id", attempt_id);

      const violationSummary = (violations || []).map(v => `${v.type} at ${v.timestamp}`).join("; ");

      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            tools: [{
              type: "function",
              function: {
                name: "analyze_proctoring",
                description: "Analyze proctoring data for fraud detection",
                parameters: {
                  type: "object",
                  properties: {
                    risk_score: { type: "number" },
                    risk_level: { type: "string", enum: ["low", "medium", "high"] },
                    findings: { type: "array", items: { type: "string" } },
                    recommendation: { type: "string", enum: ["continue", "flag_review", "terminate"] },
                  },
                  required: ["risk_score", "risk_level", "findings", "recommendation"],
                },
              },
            }],
            tool_choice: { type: "function", function: { name: "analyze_proctoring" } },
            messages: [
              { role: "system", content: "You are a proctoring AI. Analyze violation patterns and assess fraud risk. Be fair but vigilant." },
              { role: "user", content: `Violations: ${violationSummary || "None"}\nCaptures: ${logs.length}` },
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
          let analysis = { risk_score: 0, risk_level: "low", findings: [], recommendation: "continue" };
          if (toolCall) try { analysis = JSON.parse(toolCall.function.arguments); } catch {}

          for (const log of logs) {
            await supabase.from("proctoring_logs").update({ ai_flag: analysis.risk_level, ai_score: analysis.risk_score, ai_details: analysis }).eq("id", log.id);
          }

          if (analysis.recommendation === "terminate") {
            await supabase.from("exam_attempts").update({ status: "terminated" }).eq("id", attempt_id);
          }
          return jsonResp({ analysis, analyzed: logs.length });
        }
      } catch (e) {
        console.error("AI error:", e);
      }
      return jsonResp({ analyzed: 0 });
    }

    return jsonResp({ error: "Unknown action" }, 400);
  } catch (err) {
    console.error("exam-manager error:", err);
    return jsonResp({ error: err instanceof Error ? err.message : "Internal error" }, 500);
  }
});

function jsonResp(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
