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

// Configuração do multer para upload de arquivos na pasta uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Cria a pasta uploads caso não exista
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Função para gerar código no formato A11 + 8 dígitos
function gerarCodigo() {
  return 'A11' + Math.floor(10000000 + Math.random() * 90000000).toString();
}

// Rota para receber o formulário
// Ajustei para 'upload.fields' porque seu formulário envia 2 arquivos: 'foto' e 'assinatura'
app.post('/submit', upload.fields([{ name: 'foto' }, { name: 'assinatura' }]), (req, res) => {
  const dados = req.body;
  const codigo = dados.codigo_barras || gerarCodigo();

  // Cria pasta pdfs se não existir
  if (!fs.existsSync('./pdfs')) {
    fs.mkdirSync('./pdfs');
  }

  const nomePdf = `pdfs/${codigo}.pdf`;
  const caminhoPdf = path.join(__dirname, nomePdf);

  const doc = new PDFDocument({
    size: [141.73, 538.58], // 5cm x 19cm
    margin: 10
  });

  doc.pipe(fs.createWriteStream(caminhoPdf));

  doc.fontSize(14).text('INATRO', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text('Marcação Online', { align: 'center' });
  doc.moveDown();
  doc.text('Informação');
  doc.fontSize(10);
  doc.text(`Código do Cliente: ${codigo}`);
  doc.text(`Nome do Cliente: ${dados.nome || dados.nomeCompleto || ''}`);
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

  res.json({ sucesso: true, pdf: nomePdf });
});

// Corrigido erro de digitação: app.listen e não app.liste
app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});
    
