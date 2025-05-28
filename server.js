const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });
app.use('/uploads', express.static('uploads'));

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
if (!fs.existsSync('data')) {
  fs.mkdirSync('data');
}

app.post('/submit', upload.fields([
  { name: 'foto', maxCount: 1 },
  { name: 'assinatura', maxCount: 1 }
]), (req, res) => {
  const dados = req.body;
  const arquivos = req.files;

  const entrada = {
    ...dados,
    foto: arquivos?.foto ? arquivos.foto[0].path : null,
    assinatura: arquivos?.assinatura ? arquivos.assinatura[0].path : null,
    timestamp: new Date().toISOString()
  };

  const jsonPath = 'data/entradas.json';

  let entradas = [];
  if (fs.existsSync(jsonPath)) {
    const content = fs.readFileSync(jsonPath);
    entradas = JSON.parse(content);
  }
  entradas.push(entrada);
  fs.writeFileSync(jsonPath, JSON.stringify(entradas, null, 2));

  res.status(200).json({ message: 'Dados recebidos com sucesso.' });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});