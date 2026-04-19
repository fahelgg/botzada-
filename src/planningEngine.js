const { getGoals, getSummary } = require("./financeService");
const { getProfile } = require("./profileService");

function generatePlan() {
  const goals = getGoals();
  const profile = getProfile();
  const summary = getSummary();

  if (!goals.length) {
    return "Você ainda não definiu nenhuma meta. Me fala o que quer conquistar e eu monto um plano pra você.";
  }

  const monthlyIncome = profile.monthlyIncome || summary.monthEntries || 0;
  const investmentRate = profile.investmentRate || 0.2;
  const monthlyContribution = monthlyIncome * investmentRate;

  let response = "📊 Seu plano financeiro atual:\n";
  response += "─────────────────────────────\n\n";

  goals.forEach((goal, index) => {
    const targetAmount = goal.target_amount || goal.targetAmount || 0;
    const currentAmount = goal.current_amount || goal.currentAmount || 0;
    const remaining = targetAmount - currentAmount;

    const contribution = monthlyContribution > 0 ? monthlyContribution : 1;
    const months = Math.ceil(remaining / contribution);
    const years = Math.floor(months / 12);
    const restMonths = months % 12;

    const timeText =
      years > 0
        ? `${years} ano${years > 1 ? "s" : ""} e ${restMonths} mês${restMonths !== 1 ? "es" : ""}`
        : `${months} mês${months !== 1 ? "es" : ""}`;

    response += `${index + 1}. ${goal.name}\n`;
    response += `   Objetivo: R$ ${targetAmount.toFixed(2)}\n`;
    response += `   Acumulado: R$ ${currentAmount.toFixed(2)}\n`;
    response += `   Faltam: R$ ${remaining.toFixed(2)}\n`;
    response += `   Aporte mensal sugerido: R$ ${contribution.toFixed(2)}\n`;
    response += `   Tempo estimado: ${timeText}\n\n`;
  });

  response += "─────────────────────────────\n";
  response += `Renda mensal: R$ ${monthlyIncome.toFixed(2)}\n`;
  response += `Taxa de investimento: ${(investmentRate * 100).toFixed(0)}%\n`;
  response += `Aporte mensal: R$ ${monthlyContribution.toFixed(2)}\n`;

  if (profile.phase) {
    response += `Fase atual: ${profile.phase}\n`;
  }

  if (monthlyContribution === 0) {
    response +=
      "\n⚠️ Configure sua renda mensal para cálculos mais precisos: perfil monthlyIncome 1500";
  }

  return response;
}

module.exports = {
  generatePlan,
};