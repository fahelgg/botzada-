const fs = require("fs");
const path = require("path");

const notesPath = path.join(__dirname, "..", "data", "notes.json");

function ensureNotes() {
  if (!fs.existsSync(notesPath)) {
    fs.writeFileSync(notesPath, JSON.stringify({ notes: [] }, null, 2));
  }
}

function getNotes() {
  ensureNotes();
  return JSON.parse(fs.readFileSync(notesPath)).notes || [];
}

function addNote({ title, content }) {
  ensureNotes();
  const data = JSON.parse(fs.readFileSync(notesPath));

  const note = {
    id: Date.now(),
    title: title || "Sem título",
    content,
    created_at: new Date().toISOString(),
  };

  data.notes.push(note);
  fs.writeFileSync(notesPath, JSON.stringify(data, null, 2));

  return note;
}

function removeNote(id) {
  ensureNotes();
  const data = JSON.parse(fs.readFileSync(notesPath));
  data.notes = data.notes.filter((n) => n.id !== id);
  fs.writeFileSync(notesPath, JSON.stringify(data, null, 2));
}

function formatNotes() {
  const notes = getNotes();

  if (!notes.length) {
    return "Nenhuma nota salva ainda.";
  }

  return notes
    .map((n, i) => {
      const date = new Date(n.created_at).toLocaleDateString("pt-BR");
      return `${i + 1}. [${date}] ${n.title}\n   ${n.content}`;
    })
    .join("\n\n");
}

module.exports = {
  getNotes,
  addNote,
  removeNote,
  formatNotes,
};