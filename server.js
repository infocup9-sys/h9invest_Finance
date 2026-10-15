import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const DB_FILE = path.join(__dirname, 'database.json');

let db = {
  adminCredentials: {
    email: "h9invest@gmail.com",
    password: "h9invest@gmail.com"
  },
  registeredUsers: {}
};

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } else {
      saveDatabase();
    }
  } catch (err) {
    console.error("Errore DB:", err);
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error("Errore salvataggio DB:", err);
  }
}

loadDatabase();

app.post('/api/auth/register', (req, res) => {
  const { email, password, username, referredBy } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Dati mancanti" });

  const cleanEmail = email.toLowerCase();
  if (cleanEmail === db.adminCredentials.email.toLowerCase()) {
    return res.status(403).json({ error: "Email riservata" });
  }

  db.registeredUsers[cleanEmail] = {
    email,
    password,
    username: username || "User",
    referredBy: referredBy || null,
    createdAt: new Date().toISOString()
  };
  saveDatabase();
  res.json({ success: true });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(401).json({ error: "Credenziali non valide" });

  const cleanEmail = email.toLowerCase();
  if (cleanEmail === db.adminCredentials.email.toLowerCase() && password === db.adminCredentials.password) {
    return res.json({ token: "admin-global-secure-token", account: { email: db.adminCredentials.email, role: "admin" } });
  }

  const user = db.registeredUsers[cleanEmail];
  if (user && user.password === password) {
    return res.json({ token: `user-token-${Date.now()}`, account: { email: user.email, username: user.username, role: "user" } });
  }

  res.status(401).json({ error: "Credenziali errate" });
});

app.get('/api/admin/users', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.includes("admin-global-secure-token")) {
    return res.status(401).json({ error: "Non autorizzato" });
  }
  res.json({ users: Object.values(db.registeredUsers) });
});

app.put('/api/admin/credentials', (req, res) => {
  const { currentEmail, currentPassword, newEmail, newPassword } = req.body || {};
  if (currentEmail?.toLowerCase() === db.adminCredentials.email.toLowerCase() && currentPassword === db.adminCredentials.password) {
    if (newEmail) db.adminCredentials.email = newEmail;
    if (newPassword) db.adminCredentials.password = newPassword;
    saveDatabase();
    return res.json({ success: true });
  }
  res.status(401).json({ success: false, message: "Credenziali attuali errate" });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
});
