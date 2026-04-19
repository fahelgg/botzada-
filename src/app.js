require("dotenv").config();

const readline = require("readline");
const { interpretMessage } = require("./ai");
const { fallbackParse } = require("./parserFallback");
const {
  addTransaction,
  getSummary,
  getSettings,
  updateSetting,
  addGoal,
  getGoals,
} = require("./financeService");
const { evaluatePurchase } = require("./decisionEngine");
const { toMoney } = require("./utils");
const { generatePlan } = require("./planningEngine");
const { giveAdvice, analyzeImpulse } = require("./adviceEngine");
const { updateProfile } = require("./profileService");
const {
  buildPurchaseAdvice,
  buildGeneralAdvice,
} = require("./personalityEngine");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function buildContext() {
  return {
    summary: getSummary(),
    settings: getSettings(),
    goals: getGoals(),
  };
}

function formatSummary() {
  const summary = getSummary();

  return [
    `Saldo atual: ${toMoney(summary.currentBalance)}`,
    `Entradas no mês: ${toMoney(summary.monthEntries)}`,
    `Saídas no mês: ${toMoney(summary.monthExits)}`,
    `Investido no mês: ${toMoney(summary.monthInvested)}`,
    `Total de registros: ${summary.transactionCount}`,
  ].join("\n");
}

function formatPurchaseEvaluation(result) {
  return [
    `Veredito: ${result.verdict}`,
    `Valor analisado: ${toMoney(result.amount)}`,
    `Saldo projetado: ${toMoney(result.projectedBalance)}`,
    `Risco: ${result.riskScore}/10`,
    "Motivos:",
    ...result.reasons.map((reason) => `- ${reason}`),
  ].join("\n");
}

async function handleMessage(message) {
  const originalMessage = String(message || "").trim();
  const normalizedMessage = originalMessage.toLowerCase();
  const context = buildContext();

  if (normalizedMessage.includes("plano")) {
    return generatePlan();
  }

     if (
    normalizedMessage.includes("me aconselha") ||
    normalizedMessage.includes("dica")
  ) {
    return buildGeneralAdvice();
  }

  if (normalizedMessage.includes("impulsivo")) {
    const amountMatch = originalMessage.match(/(\d+[\.,]?\d*)/);
    const amount = amountMatch
      ? Number(amountMatch[1].replace(",", "."))
      : null;

    return analyzeImpulse(originalMessage, amount);
  }

  if (normalizedMessage.startsWith("perfil")) {
    const parts = originalMessage.split(" ");
    const key = parts[1];
    const rawValue = parts.slice(2).join(" ").trim();

    if (!key || !rawValue) {
      return "Use assim: perfil nomeDaConfiguracao valor";
    }

    const numericValue = Number(rawValue.replace(",", "."));
    const finalValue = Number.isNaN(numericValue) ? rawValue : numericValue;

    updateProfile(key, finalValue);
    return `Perfil atualizado: ${key} = ${finalValue}`;
  }

  let parsed;
  try {
    parsed = await interpretMessage(originalMessage, context);
  } catch (error) {
    parsed = fallbackParse(originalMessage);
  }

  if (parsed.intent === "registrar_transacao") {
    const data = parsed.data || {};

    if (!data.amount || !data.type) {
      return "Não consegui registrar porque faltou valor ou tipo da movimentação.";
    }

    addTransaction({
      type: data.type,
      category: data.category || "geral",
      description: data.description || originalMessage,
      amount: data.amount,
    });

    return `${parsed.reply}\n\nMovimentação registrada com sucesso.\n${formatSummary()}`;
  }

  if (parsed.intent === "avaliar_compra") {
    const amount = parsed.data?.amount;

    if (!amount) {
      return "Não consegui avaliar essa compra porque não identifiquei o valor.";
    }

    const result = evaluatePurchase({
      amount,
      description: parsed.data?.description || originalMessage,
    });

    return buildPurchaseAdvice(result);
  }
  if (parsed.intent === "resumo") {
    return formatSummary();
  }

  if (parsed.intent === "configurar") {
    const key = parsed.data?.settingKey;
    const value = parsed.data?.settingValue;

    if (!key || value === undefined) {
      return "Não consegui atualizar a configuração.";
    }

    updateSetting(key, value);
    return `Configuração atualizada: ${key} = ${value}`;
  }

  if (parsed.intent === "adicionar_meta") {
    const name = parsed.data?.name;
    const targetAmount = parsed.data?.targetAmount;

    if (!name || !targetAmount) {
      return "Não consegui adicionar a meta porque faltou nome ou valor.";
    }

    addGoal({
      name,
      targetAmount,
    });

    return `Meta adicionada com sucesso: ${name} - ${toMoney(targetAmount)}`;
  }

  return parsed.reply || "Entendi. Me passe mais detalhes.";
}

console.log("Bot financeiro iniciado no modo terminal.");
console.log("Exemplos:");
console.log("- entrou 1500 salario");
console.log("- gastei 45 internet");
console.log("- posso comprar um tenis de 320?");
console.log("- resumo");
console.log("- perfil monthlyIncome 1500");
console.log("- plano");
console.log("- me aconselha");
console.log("- to impulsivo com 400");
console.log("- sair\n");

function prompt() {
  rl.question("> ", async (message) => {
    if (message.trim().toLowerCase() === "sair") {
      rl.close();
      return;
    }

    try {
      const reply = await handleMessage(message);
      console.log(`\n${reply}\n`);
    } catch (error) {
      console.error("Erro:", error.message);
    }

    prompt();
  });
}

prompt();