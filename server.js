const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname)));

const uploadPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

app.post('/api/captacao', upload.fields([
  { name: 'foto', maxCount: 1 },
  { name: 'assinatura', maxCount: 1 }
]), (req, res) => {
  const dados = req.body;
  const arquivos = req.files;

  const jsonPath = path.join(__dirname, 'dados_recebidos.json');
  const entrada = {
    timestamp: new Date(),
    dados,
    arquivos
  };

  fs.appendFileSync(jsonPath, JSON.stringify(entrada, null, 2) + ',
');
  res.status(200).json({ mensagem: 'Dados recebidos com sucesso!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
