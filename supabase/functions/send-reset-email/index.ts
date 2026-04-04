// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, user_type, origin } = await req.json();

    if (!email || !user_type || !origin) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, user_type, origin" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const table = user_type === "admin" ? "admins" : "alunos";

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from(table)
      .select("id, nome, email")
      .eq("email", email.trim().toLowerCase())
      .single();

    if (userError || !user) {
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ message: "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    // Store token in the user's table
    const { error: updateError } = await supabase
      .from(table)
      .update({
        reset_token: token,
        reset_expires: expiresAt,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error storing token:", updateError);
      return new Response(
        JSON.stringify({ error: "Erro interno ao processar solicitação." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build reset URL
    const loginPath = user_type === "admin" ? "/admin/login" : "/student/login";
    const resetUrl = `${origin}${loginPath}?token=${token}&email=${encodeURIComponent(email.trim().toLowerCase())}&reset=true`;

    console.log(`Reset link generated for ${email}: ${resetUrl}`);

    // Try to send email via transactional email system
    try {
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "password-reset",
          recipientEmail: email.trim().toLowerCase(),
          idempotencyKey: `reset-${user.id}-${token}`,
          templateData: {
            name: user.nome,
            resetUrl,
          },
        },
      });
      console.log(`Reset email sent to ${email}`);
    } catch (emailError) {
      // If transactional email is not set up yet, log and continue
      console.warn("Transactional email not available, token stored but email not sent:", emailError);
    }

    return new Response(
      JSON.stringify({ 
        message: "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha." 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-reset-email:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
