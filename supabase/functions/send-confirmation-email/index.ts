// @ts-nocheck
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, nome, token, origin } = await req.json();

    if (!email || !nome || !token || !origin) {
      throw new Error("Missing required fields: email, nome, token, origin");
    }

    const confirmUrl = `${origin}/confirmar-email?token=${token}`;

    console.log(`Enviando e-mail de confirmação para ${email} (${nome})`);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "Academico <onboarding@resend.dev>",
            to: [email.trim().toLowerCase()],
            subject: "Confirme seu e-mail - Academico",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #3b82f6;">Olá, ${nome}!</h1>
                <p>Bem-vindo ao Academico. Para começar a usar sua conta, por favor confirme seu e-mail clicando no botão abaixo:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${confirmUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Confirmar meu E-mail
                  </a>
                </div>
                <p>Este link é válido por 1 hora.</p>
                <p>Se o botão acima não funcionar, copie e cole o seguinte link no seu navegador:</p>
                <p style="word-break: break-all; color: #666;">${confirmUrl}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #999;">Se você não criou esta conta, ignore este e-mail.</p>
              </div>
            `,
          }),
        });

        if (res.ok) {
          console.log(`Confirmation email sent to ${email} via Resend`);
        } else {
          const errorText = await res.text();
          console.error("Error sending confirmation email via Resend:", errorText);
        }
      } catch (emailError) {
        console.error("Error invoking Resend API for confirmation email:", emailError);
      }
    } else {
      console.log(`RESEND_API_KEY not found. Confirmation link: ${confirmUrl}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `E-mail de confirmação para ${nome} processado.` 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Erro na função send-confirmation-email:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});