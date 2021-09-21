//Carregando módulos
const express = require("express");
const handlebars = require('express-handlebars');
const admin = require('./routers/admin');
const mongose = require('mongoose');
const path = require('path');
const app = express();


//Configurações
//express Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//handlebars
app.engine('handlebars', handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

//mongose
mongose.Promise = global.Promise
mongose.connect('mongodb://localhost/blogapp')
.then(()=>{
    console.log('Conectado ao mongo')
}).catch((err)=>{
    console.log("Erro ao se conectar:"+err)
})

//Public 
app.use(express.static(path.join(__dirname, "public")));

//Rotas
app.use('/admin', admin);

//Outros
const PORT = 8081
app.listen(PORT, () => { console.log('Servidor Rodando') });