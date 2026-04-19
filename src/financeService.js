const { readDb, writeDb } = require("./db");

function addTransaction({ type, category, description, amount }) {
  const db = readDb();

  const transaction = {
    id: db.transactions.length + 1,
    type,
    category,
    description: description || "",
    amount: Number(amount),
    created_at: new Date().toISOString(),
  };

  db.transactions.push(transaction);
  writeDb(db);

  return transaction;
}

function getAllTransactions() {
  const db = readDb();
  return db.transactions;
}

function getMonthTransactions() {
  const db = readDb();
  const now = new Date();

  return db.transactions.filter((item) => {
    const date = new Date(item.created_at);
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  });
}

function getSettings() {
  return readDb().settings;
}

function updateSetting(key, value) {
  const db = readDb();
  db.settings[key] = Number(value);
  writeDb(db);
}

function getSummary() {
  const all = getAllTransactions();
  const month = getMonthTransactions();

  const calc = (items, type) =>
    items
      .filter((i) => i.type === type)
      .reduce((acc, i) => acc + i.amount, 0);

  const totalEntries = calc(all, "entrada") + calc(all, "resgate");
  const totalExits = calc(all, "saida") + calc(all, "investimento");

  return {
    currentBalance: totalEntries - totalExits,
    monthEntries: calc(month, "entrada"),
    monthExits: calc(month, "saida"),
    monthInvested: calc(month, "investimento"),
    transactionCount: all.length,
  };
}

function getGoals() {
  return readDb().goals;
}

function addGoal({ name, targetAmount }) {
  const db = readDb();

  const goal = {
    id: db.goals.length + 1,
    name,
    target_amount: Number(targetAmount),
    current_amount: 0,
  };

  db.goals.push(goal);
  writeDb(db);

  return goal;
}

module.exports = {
  addTransaction,
  getAllTransactions,
  getMonthTransactions,
  getSettings,
  updateSetting,
  getSummary,
  getGoals,
  addGoal,
};