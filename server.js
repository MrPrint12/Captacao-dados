const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/data', express.static(path.join(__dirname, 'data')));

app.use(session({
  secret: 'inatrosessionsecret',
  resave: false,
  saveUninitialized: false
}));

const upload = multer({ dest: 'uploads/' });

const usersFile = path.join(__dirname, 'data', 'users.json');
const dataFile = path.join(__dirname, 'data', 'registros.json');

function loadUsers() {
  if (!fs.existsSync(usersFile)) return [];
  return JSON.parse(fs.readFileSync(usersFile));
}

function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

function loadData() {
  if (!fs.existsSync(dataFile)) return [];
  return JSON.parse(fs.readFileSync(dataFile));
}

function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/');
}

// Rotas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  let users = loadUsers();
  if (users.find(u => u.email === email)) return res.send('E-mail já cadastrado.');
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ name, email, password: hashedPassword });
  saveUsers(users);
  res.redirect('/');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.send('Credenciais inválidas.');
  }
  req.session.user = user;
  res.redirect('/dashboard');
});

app.get('/dashboard', isAuthenticated, (req, res) => {
  const data = loadData();
  let html = '<h2>Registros Captados</h2>';
  html += '<a href="/logout">Logout</a><ul>';
  data.forEach((entry, i) => {
    html += `<li><strong>${entry.nome}</strong> - <button onclick="window.print()">Imprimir</button></li>`;
  });
  html += '</ul>';
  res.send(html);
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

app.listen(PORT, () => {
  console.log("Servidor iniciado na porta", PORT);
});
