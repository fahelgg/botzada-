const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "finance.json");

const defaultData = {
  transactions: [],
  goals: [],
  settings: {
    monthly_income_expected: 0,
    monthly_safe_spending_limit: 0,
    emergency_reserve_target: 0,
    minimum_monthly_investment: 0,
    impulse_cooldown_hours: 72
  }
};

function ensureDb() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2), "utf-8");
  }
}

function readDb() {
  ensureDb();
  const raw = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(raw);
}

function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
}

module.exports = {
  readDb,
  writeDb
};