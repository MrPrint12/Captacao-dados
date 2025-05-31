// Servidor Express básico
const express = require('express');
const app = express();
app.listen(10000, () => console.log('Servidor iniciado na porta 10000'));