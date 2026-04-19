function toMoney(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

function normalizeText(text) {
  return String(text || "").trim().toLowerCase();
}

function startOfMonthISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01 00:00:00`;
}

module.exports = {
  toMoney,
  normalizeText,
  startOfMonthISO,
};