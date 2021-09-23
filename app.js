//Carregando módulos
const express = require("express");
const handlebars = require('express-handlebars');
const admin = require('./routers/admin');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session')
const flash = require('connect-flash')
require("./models/Postagem")
const Postagem = mongoose.model("postagens")

const app = express();

//Configurações
//session 
app.use(session({
    secret: 'blogapp',
    resave: true,
    saveUninitialized: true
}))
app.use(flash())

//middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_mg')
    res.locals.error_msg = req.flash('error_mg')
    next()
})

//express Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//handlebars
app.engine('handlebars', handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

//mongoose
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/blogapp')
    .then(() => {
        console.log('Conectado ao mongo')
    }).catch((err) => {
        console.log("Erro ao se conectar:" + err)
    })

//Public 
app.use(express.static(path.join(__dirname, "public")));

//Rotas
app.get("/", (req, res) => {

    Postagem.find().populate("categoria").sort({ data: 'desc' })
        .then((postagens) => {
            res.render("index", { postagens: postagens.map(postagens => postagens.toJSON()) })
        }).catch((err) => {
            req.flash("error_msg", "Houve um ero interno")
            // res.redirect("/404")
        })
})

app.get("/404", (req, res) => {
    res.send('Erro:404')
})
app.use('/admin', admin);

//Outros
const PORT = 8081
app.listen(PORT, () => { console.log('Servidor Rodando') });