import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: callerAdmin } = await callerClient
      .from("admins").select("id, role").eq("id", caller.id).single();

    if (!callerAdmin) {
      return new Response(JSON.stringify({ error: "Acesso negado" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { nome, email, senha } = await req.json();
    const normalizedEmail = (email || "").trim().toLowerCase();

    if (!normalizedEmail || !senha || senha.length < 6) {
      return new Response(
        JSON.stringify({ error: "Email e senha (mín. 6 caracteres) são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check if already an admin
    const { data: existingAdmin } = await adminClient
      .from("admins").select("id").eq("email", normalizedEmail).single();

    if (existingAdmin) {
      return new Response(
        JSON.stringify({ error: "Este email já está cadastrado como administrador" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try to create user in Auth
    let userId: string;
    const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
      email: normalizedEmail,
      password: senha,
      email_confirm: true,
    });

    if (createError) {
      // If user already exists in Auth, find them and reuse
      if (createError.message.includes("already been registered")) {
        const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
        if (listError) {
          return new Response(JSON.stringify({ error: listError.message }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const existingUser = (users || []).find((u: any) => u.email === normalizedEmail);
        if (!existingUser) {
          return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        userId = existingUser.id;

        // Update password and confirm email
        await adminClient.auth.admin.updateUser(userId, {
          password: senha,
          email_confirm: true,
        });
      } else {
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      if (!authData.user) {
        return new Response(JSON.stringify({ error: "Erro ao criar usuário" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = authData.user.id;
    }

    // Insert into admins table
    const { error: insertError } = await adminClient.from("admins").insert({
      id: userId,
      email: normalizedEmail,
      nome: (nome || "").trim(),
      role: "admin",
    });

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ id: userId, email: normalizedEmail, nome }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
