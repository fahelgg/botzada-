const { getGoals } = require("./financeService");
const { getProfile } = require("./profileService");

function generatePlan() {
  const goals = getGoals();
  const profile = getProfile();

  if (!goals.length) {
    return "Você ainda não definiu metas.";
  }

  let response = "📊 Plano atual:\n\n";

  goals.forEach(goal => {
    const months = Math.ceil(goal.target_amount / (profile.monthlyIncome * profile.investmentRate || 1));

    response += `Meta: ${goal.name}\n`;
    response += `Valor: R$${goal.target_amount}\n`;
    response += `Tempo estimado: ${months} meses\n\n`;
  });

  response += `Fase atual: ${profile.phase}\n`;

  return response;
}

module.exports = {
  generatePlan
};