import { GoogleGenerativeAI } from "@google/genai";

const getApiKey = () => {
  return import.meta.env.VITE_GOOGLE_API_KEY || "";
};

export const generateQuestions = async (topic: string, count: number = 5) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Google API Key não configurada. Adicione VITE_GOOGLE_API_KEY ao seu arquivo .env");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Gere ${count} questões de múltipla escolha sobre o tema: "${topic}".
  Retorne APENAS um array JSON válido com o seguinte formato:
  [
    {
      "text": "Enunciado da questão",
      "options": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
      "correct": 0,
      "explanation": "Explicação do porquê a alternativa está correta",
      "type": "multiple",
      "points": 1
    }
  ]
  Certifique-se de que o JSON seja válido e não inclua blocos de código markdown.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  try {
    // Clean up potential markdown blocks
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Erro ao processar JSON do Gemini:", text);
    throw new Error("Falha ao processar as questões geradas pela IA.");
  }
};
