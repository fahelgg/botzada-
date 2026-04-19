const Groq = require("groq-sdk");
const { groqApiKey, groqModel } = require("./config");
const { buildSystemPrompt } = require("./prompts");

const client = new Groq({ apiKey: groqApiKey });

// Histórico de conversa — mantém contexto entre mensagens
const historico = [];

async function interpretMessage(message, context) {
  if (!groqApiKey) {
    throw new Error("GROQ_API_KEY não configurada.");
  }

  const systemPrompt = buildSystemPrompt(context);

  // Adiciona mensagem do usuário no histórico
  historico.push({ role: "user", content: message });

  // Limita histórico a 20 mensagens para não estourar o contexto
  if (historico.length > 20) {
    historico.splice(0, 2);
  }

  const response = await client.chat.completions.create({
    model: groqModel,
    messages: [
      { role: "system", content: systemPrompt },
      ...historico,
    ],
    response_format: { type: "json_object" },
  });

  const text = response.choices[0].message.content;

  // Salva resposta do assistente no histórico
  historico.push({ role: "assistant", content: text });

  return JSON.parse(text);
}

function clearHistory() {
  historico.length = 0;
}

module.exports = {
  interpretMessage,
  clearHistory,
};