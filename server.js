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
app.use(express.static('public')); // serve arquivos do frontend
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs'))); // serve PDFs

// Configuração do multer para uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

// Função para gerar código do cliente
function gerarCodigo() {
  return 'A11' + Math.floor(10000000 + Math.random() * 90000000);
}

// Rota de submissão
app.post('/submeter', upload.fields([
  { name: 'foto', maxCount: 1 },
  { name: 'assinatura', maxCount: 1 }
]), (req, res) => {
  const dados = req.body;
  const codigo = dados.codigo_barras || gerarCodigo();

  if (!fs.existsSync('./pdfs')) fs.mkdirSync('./pdfs');

  const nomePdf = `pdfs/${codigo}.pdf`;
  const caminhoPdf = path.join(__dirname, nomePdf);

  const doc = new PDFDocument({ size: [141.73, 538.58], margin: 10 });
  doc.pipe(fs.createWriteStream(caminhoPdf));

  // LOGO CENTRAL
  const logoPath = path.join(__dirname, 'public/logo.png');
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, { fit: [60, 60], align: 'center' });
  }

  doc.moveDown();
  doc.fontSize(10).text('República de Moçambique', { align: 'center' });
  doc.fontSize(14).text('INATRO - Captação de Dados', { align: 'center' });
  doc.moveDown();

  doc.fontSize(10).text(`Código do Cliente: ${codigo}`);
  doc.text(`Nome do Cliente: ${dados.nomeCompleto}`);
  doc.text(`Serviço: Captação de dados extraordinárias`);
  doc.text(`Entidade: 30310`);
  doc.text(`Referência: 78906650232`);
  doc.text(`Local de atendimento: Nampula - Delegacao`);
  doc.moveDown();
  doc.text(`Nota: O código da Carta poderá ser validada após a verificação.`);
  doc.moveDown();
  doc.text(`ID: 562186`);
  doc.text(`Telefone: 21 31 11 79    Telefax: 21 32 65 67`);
  doc.text(`Maputo - Moçambique`);
  doc.moveDown();
  doc.text(`Impresso em: ${new Date().toLocaleString()}`);
  doc.moveDown();
  doc.text(`Documento Processado por Computador`);

  doc.end();

  res.json({ sucesso: true, pdf: `/pdfs/${codigo}.pdf` });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});
