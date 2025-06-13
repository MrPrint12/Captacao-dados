// server.js
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

function gerarCodigo() {
  return 'A11' + Math.floor(10000000 + Math.random() * 90000000).toString();
}

app.post('/submeter', upload.fields([
  { name: 'foto', maxCount: 1 },
  { name: 'assinatura', maxCount: 1 }
]), (req, res) => {
  const dados = req.body;
  const codigo = dados.codigo_barras || gerarCodigo();

  const doc = new PDFDocument({ size: [141.73, 538.58], margin: 10 });
  if (!fs.existsSync('./pdfs')) fs.mkdirSync('./pdfs');

  const nomePdf = `${codigo}.pdf`;
  const caminhoPdf = path.join(__dirname, 'pdfs', nomePdf);
  const stream = fs.createWriteStream(caminhoPdf);
  doc.pipe(stream);

  doc.fontSize(14).text('INATRO', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text('Marcação Online', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10);
  doc.text(`Código do Cliente: ${codigo}`);
  doc.text(`Nome do Cliente: ${dados.nomeCompleto}`);
  doc.text(`Serviço: Captação de dados extraordinárias`);
  doc.text(`Entidade: 30310`);
  doc.text(`Referência: 78906650232`);
  doc.text(`Local de atendimento: Nampula - Delegacao`);
  doc.moveDown();
  doc.text(`Nota: O código da Carta poderá ser validado após a verificação.`);
  doc.moveDown();
  doc.text(`ID: 562186`);
  doc.text(`Telefone: 21 31 11 79    Telefax: 21 32 65 67`);
  doc.text(`Maputo - Moçambique`);
  doc.moveDown();
  doc.text(`Impresso em: ${new Date().toLocaleString()}`);
  doc.moveDown();
  doc.text(`Documento Processado por Computador`);
  doc.end();

  stream.on('finish', () => {
    res.json({ sucesso: true, link: `/pdfs/${nomePdf}` });
  });
});

// Criar diretórios se não existirem
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');
if (!fs.existsSync('./pdfs')) fs.mkdirSync('./pdfs');

app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});
