// @ts-nocheck
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Student {
  nome: string;
  email: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { record } = await req.json();
    const student: Student = record;

    if (!student.email) {
      throw new Error("Missing student email");
    }

    console.log(`Enviando e-mail de boas-vindas para ${student.email} (${student.nome})`);

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
            to: [student.email.trim().toLowerCase()],
            subject: "Bem-vindo ao Academico",
            html: `
              <h1>Bem-vindo ao Academico, ${student.nome}!</h1>
              <p>É um prazer tê-lo conosco.</p>
              <p>Sua conta foi criada com sucesso e você já pode acessar nossa plataforma.</p>
              <p>Qualquer dúvida, estamos à disposição.</p>
            `,
          }),
        });

        if (res.ok) {
          console.log(`Welcome email sent to ${student.email} via Resend`);
        } else {
          const errorText = await res.text();
          console.error("Error sending welcome email via Resend:", errorText);
        }
      } catch (emailError) {
        console.error("Error invoking Resend API for welcome email:", emailError);
      }
    } else {
      console.log(`RESEND_API_KEY not found. Skipping welcome email.`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `E-mail de boas-vindas para ${student.nome} processado.` 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Erro na função welcome-email:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
