const express = require('express');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 10000;

// Configuração multer para upload de arquivos
const storage = multer.memoryStorage(); // armazenar na memória para gerar PDF direto
const upload = multer({ storage });

function gerarCodigo() {
  return 'A11' + Math.floor(10000000 + Math.random() * 90000000).toString();
}

app.post('/submeter', upload.fields([
  { name: 'foto', maxCount: 1 },
  { name: 'assinatura', maxCount: 1 }
]), (req, res) => {
  const dados = req.body;
  const codigo = gerarCodigo();

  // Criar PDF em memória e enviar direto na resposta
  const doc = new PDFDocument({ size: [141.73, 538.58], margin: 10 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${codigo}.pdf`);

  doc.pipe(res);

  // Título e logo
  doc.fontSize(16).text('República de Moçambique', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(14).text('INATRO', { align: 'center' });
  doc.moveDown();

  // Dados do formulário
  doc.fontSize(10);
  doc.text(`Código do Cliente: ${codigo}`);
  doc.text(`Nome: ${dados.nome || '---'}`);
  doc.text(`Data Nascimento: ${dados.data_nascimento || '---'}`);
  doc.text(`Tipo Documento: ${dados.tipo_documento || '---'}`);
  doc.text(`Número Documento: ${dados.numero_documento || '---'}`);
  doc.text(`Sexo: ${dados.sexo || '---'}`);
  doc.text(`Nacionalidade: ${dados.nacionalidade || '---'}`);
  doc.text(`Bairro: ${dados.bairro || '---'}`);
  doc.text(`Classe Carta: ${dados.classe_carta || '---'}`);
  doc.text(`Escola: ${dados.escola || '---'}`);

  doc.moveDown();
  doc.text(`Impresso em: ${new Date().toLocaleString()}`);

  doc.end();
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
