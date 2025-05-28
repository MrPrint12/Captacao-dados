
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.static("public"));

// Garante criação de pastas
const uploadsDir = path.join(__dirname, "uploads");
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

app.post("/submit", upload.fields([
  { name: "foto", maxCount: 1 },
  { name: "assinatura", maxCount: 1 },
]), async (req, res) => {
  try {
    const data = req.body;
    data.foto = req.files["foto"]?.[0]?.filename || "";
    data.assinatura = req.files["assinatura"]?.[0]?.filename || "";
    const filePath = path.join(__dirname, "data", Date.now() + ".json");
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    setTimeout(() => res.status(200).send("OK"), 10000);
  } catch (err) {
    console.error("Erro:", err);
    res.status(500).send("Erro ao processar.");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
