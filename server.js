
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage: storage });

app.post("/enviar", upload.fields([{ name: "foto" }, { name: "assinatura" }]), (req, res) => {
  const dados = req.body;
  const arquivos = req.files;
  const entrada = {
    ...dados,
    foto: arquivos.foto ? arquivos.foto[0].filename : null,
    assinatura: arquivos.assinatura ? arquivos.assinatura[0].filename : null,
    timestamp: new Date().toISOString()
  };

  const jsonPath = path.join(__dirname, "data", "dados.json");
  let dadosExistente = [];
  if (fs.existsSync(jsonPath)) {
    dadosExistente = JSON.parse(fs.readFileSync(jsonPath));
  }
  dadosExistente.push(entrada);
  fs.writeFileSync(jsonPath, JSON.stringify(dadosExistente, null, 2));
  res.send("Dados recebidos com sucesso!");
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
