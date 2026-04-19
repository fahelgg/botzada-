const { getProfile } = require("./profileService");
const { getGoals, getSummary } = require("./financeService");
const { toMoney } = require("./utils");

function buildPurchaseAdvice(result) {
  const profile = getProfile();
  const goals = getGoals();
  const summary = getSummary();

  const lines = [];

  if (result.verdict === "compra não recomendada") {
    lines.push("Eu não seguiria com essa compra agora.");
  } else if (result.verdict === "compra arriscada") {
    lines.push("Você até consegue comprar, mas seria uma decisão arriscada.");
  } else if (result.verdict === "compra aceitável com cautela") {
    lines.push("Essa compra cabe com cautela, mas ainda pede controle.");
  } else {
    lines.push("Dentro do seu cenário atual, essa compra parece saudável.");
  }

  if (profile.phase === "construção") {
    lines.push(
      "Você ainda está em fase de construção, então seu dinheiro deveria fortalecer base, estrutura e meta antes de satisfazer vontade momentânea."
    );
  }

  if (goals.length > 0) {
    const topGoal = goals[0];
    lines.push(
      `Sua prioridade atual precisa ser ${topGoal.name}, então qualquer gasto fora disso tem que se justificar muito bem.`
    );
  }

  if (summary.monthExits > summary.monthEntries && summary.monthEntries > 0) {
    lines.push(
      "Seu mês já está mais pesado nas saídas do que deveria, então esse não é um bom momento para afrouxar."
    );
  }

  if (result.riskScore >= 5) {
    lines.push("Meu conselho é não comprar agora. Espera, respira e reavalia depois.");
  } else if (result.riskScore >= 3) {
    lines.push("Se isso não estava planejado, segura pelo menos 72 horas antes de decidir.");
  } else {
    lines.push("Se isso for algo planejado e fizer sentido real, dá para considerar.");
  }

  lines.push(`Saldo projetado depois da compra: ${toMoney(result.projectedBalance)}`);
  lines.push(`Risco percebido: ${result.riskScore}/10`);

  return lines.join("\n");
}

function buildGeneralAdvice() {
  const profile = getProfile();
  const goals = getGoals();
  const summary = getSummary();

  const lines = [];

  if (profile.phase === "construção") {
    lines.push("Sua fase atual pede disciplina, não pressa.");
    lines.push(
      "Agora é momento de fortalecer base, organizar metas e evitar gastos que só aliviam o momento."
    );
  }

  if (goals.length > 0) {
    lines.push(`Sua meta principal hoje é ${goals[0].name}.`);
  }

  if (profile.impulseLevel >= 7) {
    lines.push(
      "Como seu nível de impulso está alto, você precisa desconfiar mais das vontades rápidas."
    );
  }

  if (summary.currentBalance <= 0) {
    lines.push("Seu saldo não te dá margem agora. O foco precisa ser recuperar controle.");
  } else {
    lines.push(
      `Você ainda tem ${toMoney(summary.currentBalance)} de saldo, então a decisão certa agora é usar isso com intenção, não por impulso.`
    );
  }

  lines.push("Pensa sempre assim: isso me fortalece ou só me satisfaz por pouco tempo?");

  return lines.join("\n");
}

module.exports = {
  buildPurchaseAdvice,
  buildGeneralAdvice,
};