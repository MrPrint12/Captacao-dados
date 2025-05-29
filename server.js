const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Diretórios para uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'formulario.html'));
});

app.post('/submit', upload.fields([{ name: 'foto' }, { name: 'assinatura' }]), (req, res) => {
  const dados = req.body;
  const arquivos = req.files;

  const entrada = {
    ...dados,
    foto: arquivos['foto'] ? arquivos['foto'][0].filename : null,
    assinatura: arquivos['assinatura'] ? arquivos['assinatura'][0].filename : null,
    timestamp: new Date().toISOString()
  };

  const jsonPath = path.join(__dirname, 'submissoes.json');
  let lista = [];
  if (fs.existsSync(jsonPath)) {
    lista = JSON.parse(fs.readFileSync(jsonPath));
  }
  lista.push(entrada);
  fs.writeFileSync(jsonPath, JSON.stringify(lista, null, 2));

  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});