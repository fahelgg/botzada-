const { getSummary } = require("./financeService");
const { getProfile } = require("./profileService");

function giveAdvice(message) {
  const summary = getSummary();
  const profile = getProfile();

  let advice = "";

  if (summary.currentBalance <= 0) {
    advice += "Você está sem margem. Agora não é hora de gastar.\n";
  }

  if (profile.phase === "construção") {
    advice += "Você está em fase de construção. Priorize estrutura e investimento.\n";
  }

  if (profile.impulseLevel >= 7) {
    advice += "Seu nível de impulso está alto. Evite decisões rápidas.\n";
  }

  if (!advice) {
    advice = "Sua situação está equilibrada, mas continue disciplinado.";
  }

  return advice;
}

function analyzeImpulse(message, amount) {
  if (!amount) return "Não consegui avaliar o valor.";

  if (amount > 300) {
    return "⚠️ Isso parece um gasto impulsivo relevante.";
  }

  return "Baixo risco de impulso.";
}

module.exports = {
  giveAdvice,
  analyzeImpulse
};