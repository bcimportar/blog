//Carregando módulos
const express = require("express");
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const mongose = require('bodyParser');
const admin = require('./routers/admin');

const app = express();


//Configurações
//express Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//handlebars
app.engine('handlebars', handlebars({ defaultLayout:'main'}));
app.set('view engine', 'handlebars');

//mongose


//Rotas
app.use('/admin',admin);

//Outros
const PORT = 8081
app.listen(PORT, () => { console.log('Servidor Rodando') });