const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

const upload = multer({ dest: 'uploads/' });

app.post('/submit', upload.fields([
  { name: 'foto', maxCount: 1 },
  { name: 'assinatura', maxCount: 1 }
]), (req, res) => {
  const entrada = {
    nome: req.body.nome,
    nascimento: req.body.nascimento,
    tipoDocumento: req.body.tipoDocumento,
    numeroDocumento: req.body.numeroDocumento,
    emissao: req.body.emissao,
    nacionalidade: req.body.nacionalidade,
    natural: req.body.natural,
    contactos: req.body.contactos,
    bairro: req.body.bairro,
    classeCarta: req.body.classeCarta,
    observacoes: req.body.observacoes,
    foto: req.files['foto'] ? req.files['foto'][0].path : null,
    assinatura: req.files['assinatura'] ? req.files['assinatura'][0].path : null,
    timestamp: new Date().toISOString()
  };

  const jsonPath = path.join(__dirname, 'entradas.json');
  let dados = [];

  if (fs.existsSync(jsonPath)) {
    const conteudo = fs.readFileSync(jsonPath);
    if (conteudo.length > 0) {
      dados = JSON.parse(conteudo);
    }
  }

  dados.push(entrada);
  fs.writeFileSync(jsonPath, JSON.stringify(dados, null, 2));

  res.send('Dados recebidos com sucesso!');
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
