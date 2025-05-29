const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Pasta de uploads
const uploadPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

app.post('/submit', upload.fields([{ name: 'foto' }, { name: 'assinatura' }]), (req, res) => {
  const data = req.body;
  data.foto = req.files['foto']?.[0]?.filename || null;
  data.assinatura = req.files['assinatura']?.[0]?.filename || null;
  data.timestamp = new Date().toISOString();

  const dadosPath = path.join(__dirname, 'dados.json');
  let registros = [];

  if (fs.existsSync(dadosPath)) {
    const raw = fs.readFileSync(dadosPath);
    registros = JSON.parse(raw);
  }

  registros.push(data);
  fs.writeFileSync(dadosPath, JSON.stringify(registros, null, 2));

  res.send('<h2>Submissão feita com êxito!</h2><a href="/">Voltar</a>');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'formulario.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});