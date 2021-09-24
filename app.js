//Carregando módulos
const express = require("express");
const handlebars = require('express-handlebars');
const admin = require('./routers/admin');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session')
const flash = require('connect-flash')
require("./models/Postagem")
require("./models/Categoria")
const Postagem = mongoose.model("postagens")
const Categoria = mongoose.model("categorias")

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
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
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

app.get("/postagem/:slug", (req, res) => {
    Postagem.findOne({ slug: req.params.slug })
        .then((postagem) => {
            if (postagem) {
                res.render("postagem/index", { postagem: postagem.toJSON() })
            } else {
                req.flash("error_msg", "Está postagem não existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
})

app.get("/categorias", (req, res) => {
    Categoria.find()
        .then((categorias) => {
            res.render("categorias/index", { categorias: categorias.map(categorias => categorias.toJSON()) })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao listar categorias")
            res.redirect("/")
        })
})

app.get("/categorias/:slug", (req, res) => {

    Categoria.findOne({ slug: req.params.slug })
        .then((categoria) => {
            if (categoria) {
                Postagem.find({ categoria: categoria._id })
                    .then((postagens) => {
                        res.render("categorias/postagem", { postagens: postagens.map(postagens => postagens.toJSON()), categorias: categoria.toJSON() })
                    })
                    .catch((err) => {
                        req.flash("error_msg", "Houve um erro ao listar os posts")
                        res.redirect("/")
                    })
            } else {
                req.flash("error_msg", "Está categoria não existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao carregar a página desta  categoria")
            res.redirect("/")
        })
})

app.get("/404", (req, res) => {
    res.send('Erro:404')
})
app.use('/admin', admin);

//Outros
const PORT = 8081
app.listen(PORT, () => { console.log('Servidor Rodando') });