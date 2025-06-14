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

// Configuração do multer para salvar uploads na pasta 'uploads'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Nome único para evitar sobreposição
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Função para gerar código A11 + 8 dígitos
function gerarCodigo() {
  return 'A11' + Math.floor(10000000 + Math.random() * 90000000).toString();
}

app.post('/submeter', upload.fields([
  { name: 'foto', maxCount: 1 },
  { name: 'assinatura', maxCount: 1 }
]), (req, res) => {
  const dados = req.body;
  const codigo = dados.codigo_barras || gerarCodigo();

  // Criar pasta para pdfs se não existir
  if (!fs.existsSync('./pdfs')) {
    fs.mkdirSync('./pdfs');
  }

  const nomePdf = `pdfs/${codigo}.pdf`;
  const caminhoPdf = path.join(__dirname, nomePdf);

  // Gerar PDF com PDFKit
  const doc = new PDFDocument({
    size: [141.73, 538.58], // 5cm x 19cm
    margin: 10
  });

  doc.pipe(fs.createWriteStream(caminhoPdf));

  // Cabeçalho PDF
  doc.fontSize(16).text('República de Moçambique', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text('INATRO', { align: 'center' });
  doc.fontSize(12).text('Marcação Online', { align: 'center' });
  doc.moveDown();

  // Conteúdo PDF
  doc.fontSize(10);
  doc.text(`Código do Cliente: ${codigo}`);
  doc.text(`Nome Completo: ${dados.nome || ''}`);
  doc.text(`Data Nascimento: ${dados.data_nascimento || ''}`);
  doc.text(`Tipo Documento: ${dados.tipo_documento || ''}`);
  doc.text(`Número Documento: ${dados.numero_documento || ''}`);
  doc.text(`Sexo: ${dados.Sexo || ''}`);
  doc.text(`Nacionalidade: ${dados.nacionalidade || ''}`);
  doc.text(`Natural: ${dados.natural || ''}`);
  doc.text(`Contactos: ${dados.contactos || ''}`);
  doc.text(`Bairro: ${dados.bairro || ''}`);
  doc.text(`Classe de Carta: ${dados.classe_carta || ''}`);
  doc.text(`Escola de Condução: ${dados.escola || ''}`);
  doc.moveDown();
  doc.text(`Observações: ${dados.observacoes || 'Nenhuma'}`);
  doc.moveDown();
  doc.text(`Impresso em: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown();
  doc.text('Documento Processado por Computador', { align: 'center' });

  doc.end();

  res.json({ sucesso: true, mensagem: 'Dados recebidos e PDF gerado.', pdf: nomePdf });
});

app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});
    
