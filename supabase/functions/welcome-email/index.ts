import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Student {
  nome: string;
  email: string;
}

serve(async (req) => {
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

    return new Response(JSON.stringify({ 
      success: true, 
      message: `E-mail de boas-vindas para ${student.nome} processado.` 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Erro na função welcome-email:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
