const { normalizeText } = require("./utils");

function extractAmount(text) {
  const moneyMatch = text.match(/(\d+[\.,]?\d*)/);
  return moneyMatch ? Number(moneyMatch[1].replace(",", ".")) : null;
}

function fallbackParse(message) {
  const original = String(message || "").trim();
  const text = normalizeText(original);
  const amount = extractAmount(original);

  if (text.startsWith("entrou") || text.startsWith("entrada")) {
    return {
      intent: "registrar_transacao",
      data: {
        type: "entrada",
        category: "receita",
        description: original,
        amount,
      },
      reply: "Entendi como uma entrada financeira.",
    };
  }

  if (
    text.startsWith("gastei") ||
    text.startsWith("saida") ||
    text.startsWith("saída")
  ) {
    return {
      intent: "registrar_transacao",
      data: {
        type: "saida",
        category: "gasto",
        description: original,
        amount,
      },
      reply: "Entendi como uma saída financeira.",
    };
  }

  if (text.startsWith("investi") || text.startsWith("investimento")) {
    return {
      intent: "registrar_transacao",
      data: {
        type: "investimento",
        category: "investimento",
        description: original,
        amount,
      },
      reply: "Entendi como um investimento.",
    };
  }

  if (text.startsWith("resgatei") || text.startsWith("resgate")) {
    return {
      intent: "registrar_transacao",
      data: {
        type: "resgate",
        category: "resgate",
        description: original,
        amount,
      },
      reply: "Entendi como um resgate.",
    };
  }

  if (
    text.includes("posso comprar") ||
    text.includes("vale comprar") ||
    text.includes("comprar isso") ||
    text.includes("comprar um") ||
    text.includes("comprar uma")
  ) {
    return {
      intent: "avaliar_compra",
      data: {
        amount,
        description: original,
      },
      reply: "Vou avaliar essa compra com base no seu cenário atual.",
    };
  }

  if (text === "resumo" || text === "saldo" || text.includes("meu saldo")) {
    return {
      intent: "resumo",
      data: {},
      reply: "Vou montar seu resumo atual.",
    };
  }

  if (text.startsWith("configurar")) {
    const parts = original.split(" ");
    const settingKey = parts[1];
    const rawValue = parts.slice(2).join(" ").trim();
    const numericValue = Number(String(rawValue).replace(",", "."));

    return {
      intent: "configurar",
      data: {
        settingKey,
        settingValue: Number.isNaN(numericValue) ? rawValue : numericValue,
      },
      reply: "Vou atualizar essa configuração.",
    };
  }

  if (text.startsWith("adicionar meta")) {
    const targetAmount = extractAmount(original);
    const name = original
      .replace(/adicionar meta/i, "")
      .replace(/(\d+[\.,]?\d*)/, "")
      .trim();

    return {
      intent: "adicionar_meta",
      data: {
        name,
        targetAmount,
      },
      reply: "Vou adicionar essa meta.",
    };
  }

  return {
    intent: "conversa",
    data: {},
    reply: "Não consegui estruturar sua mensagem com segurança ainda.",
  };
}

module.exports = {
  fallbackParse,
};