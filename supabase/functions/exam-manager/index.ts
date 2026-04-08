import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();

    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/exam-manager/, "");
    const body = req.method !== "GET" ? await req.json().catch(() => ({})) : {};

    // ===== START EXAM =====
    if (path === "/start" && req.method === "POST") {
      if (!user) return jsonResp({ error: "Autenticação necessária" }, 401);

      const { exam_id, device_info } = body;
      if (!exam_id) return jsonResp({ error: "exam_id obrigatório" }, 400);

      // Check existing active attempt
      const { data: existing } = await supabase
        .from("exam_attempts")
        .select("*")
        .eq("user_id", user.id)
        .eq("exam_id", exam_id)
        .eq("status", "in_progress")
        .maybeSingle();

      if (existing) {
        // Return existing attempt with remaining time
        const expiresAt = new Date(existing.expires_at).getTime();
        const now = Date.now();
        const remainingSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));

        if (remainingSeconds <= 0) {
          // Expire it
          await supabase
            .from("exam_attempts")
            .update({ status: "expired" })
            .eq("id", existing.id);
          return jsonResp({ error: "Tempo expirado" }, 410);
        }

        return jsonResp({ attempt: existing, remaining_seconds: remainingSeconds });
      }

      // Check if already completed
      const { data: completed } = await supabase
        .from("exam_attempts")
        .select("id")
        .eq("user_id", user.id)
        .eq("exam_id", exam_id)
        .in("status", ["completed", "terminated"])
        .limit(1);

      // Get exam duration
      const { data: exam } = await supabase
        .from("provas")
        .select("duracao, tentativas_permitidas")
        .eq("id", exam_id)
        .single();

      if (!exam) return jsonResp({ error: "Prova não encontrada" }, 404);

      const maxAttempts = exam.tentativas_permitidas || 1;
      if (completed && completed.length >= maxAttempts) {
        return jsonResp({ error: "Limite de tentativas atingido" }, 403);
      }

      const durationMinutes = exam.duracao || 60;
      const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();

      // Get IP
      const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";

      const { data: attempt, error: insertError } = await supabase
        .from("exam_attempts")
        .insert({
          user_id: user.id,
          exam_id,
          expires_at: expiresAt,
          device_info: device_info || {},
          ip_address: ip,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        return jsonResp({ error: "Erro ao iniciar prova" }, 500);
      }

      return jsonResp({ attempt, remaining_seconds: durationMinutes * 60 });
    }

    // ===== SYNC TIME =====
    if (path === "/sync-time" && req.method === "POST") {
      if (!user) return jsonResp({ error: "Auth required" }, 401);

      const { attempt_id } = body;
      if (!attempt_id) return jsonResp({ error: "attempt_id required" }, 400);

      const { data: attempt } = await supabase
        .from("exam_attempts")
        .select("*")
        .eq("id", attempt_id)
        .eq("user_id", user.id)
        .single();

      if (!attempt) return jsonResp({ error: "Attempt not found" }, 404);

      if (attempt.status !== "in_progress") {
        return jsonResp({ error: "Exam not active", status: attempt.status }, 410);
      }

      const expiresAt = new Date(attempt.expires_at).getTime();
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));

      if (remaining <= 0) {
        await supabase
          .from("exam_attempts")
          .update({ status: "expired" })
          .eq("id", attempt_id);
        return jsonResp({ remaining_seconds: 0, status: "expired" });
      }

      return jsonResp({ remaining_seconds: remaining, status: "in_progress", violations: attempt.violations });
    }

    // ===== FINISH EXAM =====
    if (path === "/finish" && req.method === "POST") {
      if (!user) return jsonResp({ error: "Auth required" }, 401);

      const { attempt_id } = body;
      if (!attempt_id) return jsonResp({ error: "attempt_id required" }, 400);

      const { data: attempt } = await supabase
        .from("exam_attempts")
        .select("*")
        .eq("id", attempt_id)
        .eq("user_id", user.id)
        .single();

      if (!attempt) return jsonResp({ error: "Attempt not found" }, 404);

      await supabase
        .from("exam_attempts")
        .update({ status: "completed" })
        .eq("id", attempt_id);

      return jsonResp({ success: true });
    }

    // ===== TERMINATE EXAM =====
    if (path === "/terminate" && req.method === "POST") {
      if (!user) return jsonResp({ error: "Auth required" }, 401);

      const { attempt_id, reason } = body;

      await supabase
        .from("exam_attempts")
        .update({ status: "terminated" })
        .eq("id", attempt_id);

      await supabase.from("violations_log").insert({
        attempt_id,
        type: "exam_terminated",
        metadata: { reason: reason || "max_violations" },
      });

      return jsonResp({ success: true, terminated: true });
    }

    // ===== AI ANALYZE (proctoring) =====
    if (path === "/analyze" && req.method === "POST") {
      if (!user) return jsonResp({ error: "Auth required" }, 401);

      const { attempt_id } = body;
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) return jsonResp({ error: "AI not configured" }, 500);

      // Get recent proctoring logs
      const { data: logs } = await supabase
        .from("proctoring_logs")
        .select("*")
        .eq("attempt_id", attempt_id)
        .eq("ai_flag", "pending")
        .order("timestamp", { ascending: false })
        .limit(5);

      if (!logs || logs.length === 0) return jsonResp({ analyzed: 0 });

      // Get violations
      const { data: violations } = await supabase
        .from("violations_log")
        .select("type, timestamp")
        .eq("attempt_id", attempt_id);

      const violationSummary = (violations || []).map(v => `${v.type} at ${v.timestamp}`).join("; ");

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
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
                  risk_score: { type: "number", description: "0-100 risk score" },
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
            {
              role: "system",
              content: "You are a proctoring AI analyzing exam behavior. Evaluate the violation patterns and determine fraud risk. Consider repeated tab switches, fullscreen exits, and suspicious patterns. Be fair but vigilant.",
            },
            {
              role: "user",
              content: `Analyze this exam attempt:\n\nViolations: ${violationSummary || "None"}\nTotal proctoring captures: ${logs.length}\nCapture interval: 15 seconds\n\nProvide a risk assessment.`,
            },
          ],
        }),
      });

      if (!aiResponse.ok) {
        console.error("AI error:", await aiResponse.text());
        return jsonResp({ error: "AI analysis failed" }, 500);
      }

      const aiData = await aiResponse.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      let analysis = { risk_score: 0, risk_level: "low", findings: [], recommendation: "continue" };

      if (toolCall) {
        try {
          analysis = JSON.parse(toolCall.function.arguments);
        } catch { /* use defaults */ }
      }

      // Update proctoring logs
      for (const log of logs) {
        await supabase
          .from("proctoring_logs")
          .update({
            ai_flag: analysis.risk_level,
            ai_score: analysis.risk_score,
            ai_details: analysis,
          })
          .eq("id", log.id);
      }

      // If high risk, terminate
      if (analysis.recommendation === "terminate") {
        await supabase
          .from("exam_attempts")
          .update({ status: "terminated" })
          .eq("id", attempt_id);
      }

      return jsonResp({ analysis, analyzed: logs.length });
    }

    return jsonResp({ error: "Route not found" }, 404);
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
