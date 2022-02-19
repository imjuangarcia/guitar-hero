const express = require('express');
const app = express();

const layoutController = require('./controllers/layout');
const mercadolibreController = require('./controllers/meli');

app.get('/', layoutController.homepage);
app.get('/meli/scrape/:pageNumber', mercadolibreController.getUsedGuitars, mercadolibreController.getRefurbishedGuitars);
app.get('/meli/download', mercadolibreController.downloadFile);

app.listen('8081');
exports = module.exports = app;