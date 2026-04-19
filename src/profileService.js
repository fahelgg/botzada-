const fs = require("fs");
const path = require("path");

const profilePath = path.join(__dirname, "..", "data", "profile.json");

const defaultProfile = {
  monthlyIncome: 0,
  fixedExpenses: 0,
  investmentRate: 0.5,
  priorities: ["estrutura", "investimento"],
  mainGoal: "indefinido",
  phase: "construção",
  impulseLevel: 5
};

function ensureProfile() {
  if (!fs.existsSync(profilePath)) {
    fs.writeFileSync(profilePath, JSON.stringify(defaultProfile, null, 2));
  }
}

function getProfile() {
  ensureProfile();
  return JSON.parse(fs.readFileSync(profilePath));
}

function updateProfile(key, value) {
  const profile = getProfile();
  profile[key] = value;
  fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2));
}

module.exports = {
  getProfile,
  updateProfile
};