require("dotenv").config();

module.exports = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL || "gpt-5.4-mini",
  currency: process.env.CURRENCY || "BRL",
};