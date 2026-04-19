const { getSummary, getSettings, getGoals } = require("./financeService");

function evaluatePurchase({ amount, description = "compra sem descricao" }) {
  const value = Number(amount);
  const summary = getSummary();
  const settings = getSettings();
  const goals = getGoals();

  const safeMonthlyLimit = Number(settings.monthly_safe_spending_limit || 0);
  const minInvestment = Number(settings.minimum_monthly_investment || 0);
  const reserveTarget = Number(settings.emergency_reserve_target || 0);

  let riskScore = 0;
  const reasons = [];

  const projectedBalance = summary.currentBalance - value;
  const projectedMonthExits = summary.monthExits + value;

  if (projectedBalance < 0) {
    riskScore += 5;
    reasons.push("A compra deixa seu saldo negativo.");
  }

  if (safeMonthlyLimit > 0 && projectedMonthExits > safeMonthlyLimit) {
    riskScore += 2;
    reasons.push("A compra ultrapassa seu limite saudável do mês.");
  }

  if (minInvestment > 0 && projectedBalance < minInvestment) {
    riskScore += 2;
    reasons.push("A compra pode comprometer seu aporte mínimo.");
  }

  if (reserveTarget > 0 && summary.currentBalance < reserveTarget) {
    riskScore += 1;
    reasons.push("Sua reserva ainda está abaixo da meta definida.");
  }

  if (goals.length > 0) {
    reasons.push(
      `Você possui ${goals.length} meta(s) ativa(s), então essa compra deve ser comparada com suas prioridades.`
    );
  }

  let verdict = "compra saudável";

  if (riskScore >= 5) {
    verdict = "compra não recomendada";
  } else if (riskScore >= 3) {
    verdict = "compra arriscada";
  } else if (riskScore >= 1) {
    verdict = "compra aceitável com cautela";
  }

  return {
    description,
    amount: value,
    verdict,
    riskScore,
    projectedBalance,
    projectedMonthExits,
    reasons,
  };
}

module.exports = {
  evaluatePurchase,
};