const OpenAI = require("openai");
const { openaiApiKey, openaiModel } = require("./config");
const { buildSystemPrompt } = require("./prompts");

const client = new OpenAI({ apiKey: openaiApiKey });

async function interpretMessage(message, context) {
  if (!openaiApiKey) {
    throw new Error("OPENAI_API_KEY não configurada.");
  }

  const systemPrompt = buildSystemPrompt(context);

  const response = await client.responses.create({
    model: openaiModel,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: systemPrompt }],
      },
      {
        role: "user",
        content: [{ type: "input_text", text: message }],
      },
    ],
     });

  const text = response.output_text;
  return JSON.parse(text);
}

module.exports = {
  interpretMessage,
};