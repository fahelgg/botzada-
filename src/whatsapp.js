const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { interpretMessage, clearHistory } = require("./ai");
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
const { analyzeImpulse } = require("./adviceEngine");
const { buildPurchaseAdvice, buildGeneralAdvice } = require("./personalityEngine");
const { updateProfile } = require("./profileService");
const { addNote, formatNotes } = require("./noteService");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
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

async function handleMessage(message) {
  const originalMessage = String(message || "").trim();
  const normalizedMessage = originalMessage.toLowerCase();
  const context = buildContext();

  if (normalizedMessage === "limpar" || normalizedMessage === "nova conversa") {
    clearHistory();
    return "Conversa reiniciada! Como posso te ajudar?";
  }

  if (normalizedMessage === "notas" || normalizedMessage === "minhas notas") {
    return formatNotes();
  }

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
    console.error("Erro na IA, usando fallback:", error.message);
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

    return `${parsed.reply}\n\n${formatSummary()}`;
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

    addGoal({ name, targetAmount });
    return parsed.reply;
  }

  if (parsed.intent === "nota") {
    const content = parsed.data?.noteContent;
    const title = parsed.data?.noteTitle;

    if (!content) {
      return "O que você quer que eu anote?";
    }

    addNote({ title, content });
    return parsed.reply;
  }

  return parsed.reply || "Entendi. Me passe mais detalhes.";
}

client.on("qr", (qr) => {
  console.log("\nEscaneia esse QR Code com o WhatsApp:\n");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ Bot conectado ao WhatsApp!");
  console.log("Manda uma mensagem pra você mesmo para começar.\n");
});

client.on("message_create", async (msg) => {
  // Só responde mensagens enviadas por você mesmo
  if (!msg.fromMe) return;

  // Ignora mensagens em grupos
  if (msg.from.endsWith("@g.us")) return;

  // Ignora mensagem vazia
  if (!msg.body || !msg.body.trim()) return;

  console.log(`[${new Date().toLocaleTimeString("pt-BR")}] Você: ${msg.body}`);

  try {
    const reply = await handleMessage(msg.body);
    await msg.reply(reply);
  } catch (error) {
    console.error("Erro ao processar mensagem:", error.message);
    await msg.reply("Tive um problema aqui. Tenta de novo?");
  }
});

client.on("disconnected", (reason) => {
  console.log("Bot desconectado:", reason);
});

console.log("Iniciando bot do WhatsApp...");
console.log("Aguarde o QR Code aparecer para escanear.\n");

client.initialize();