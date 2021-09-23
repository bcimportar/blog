const express = require("express")
const router = express.Router()
const mongoose = require('mongoose');
require('../models/Categoria')
require('../models/Postagem')
const Categoria = mongoose.model("categorias")
const Postagem = mongoose.model("postagens")


router.get('/', (req, res) => {
    res.render("admin/index")
})

router.get('/categorias', (req, res) => {
    Categoria.find().sort({ date: 'desc' })
        .then((categorias) => {
            res.render('admin/categorias', { categorias: categorias.map(categorias => categorias.toJSON()) })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao lista categoria")
            res.redirect("/admin")
        })
})

router.get("/categorias/add", (req, res) => {
    res.render("admin/addcategorias")
})

router.post("/categorias/nova", (req, res) => {

    var erros = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome inválido" })
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug inválido" })
    }
    if (req.body.nome.length < 2) {
        erros.push({ texto: "Nome muito pequeno para categoria" })
    }
    if (erros.length > 0) {
        res.render("admin/addcategorias", { erros: erros })
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save()
            .then(() => {
                req.flash("success_msg", "Categoria salva com sucesso")
                res.redirect("/admin/categorias")
            }).catch((err) => {
                req.flash("error_msg", "Erro ao salvar categoria" + err)
                res.redirect("/admin")
            })
    }
})

router.get("/editcategorias/edit/:id", (req, res) => {
    Categoria.findOne({ _id: req.params.id })
        .then((categoria) => {
            res.render("admin/editcategoria", { categoria: categoria.toJSON() });
        }).catch((err) => {
            req.flash("error_msg", "Está categoria não existe" + err)
            res.redirect("/admin/categorias")
        })
})

router.post('/categorias/edit', (req, res) => {
    Categoria.findOne({ _id: req.body.id })
        .then((categoria) => {
            categoria.nome = req.body.nome,
                categoria.slug = req.body.slug

            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editado com sucesso");
                res.redirect("/admin/categorias")
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro interno ao salvar a edição da categoria")
                res.redirect("/admin/categorias")
            })
        })
        .catch((err) => {
            req.flash("error_msg", "Houve um erro ao editar a categoria")
            res.redirect("/admin/categorias")
        })
})

router.post("/categorias/deletar", ((req, res) => {
    Categoria.deleteOne({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao  deletar categoria")
        //res.redirect("/admin/categorias")

    })
}))


router.get("/postagens", (req, res) => {
    Postagem.find().populate("categoria").sort({ date: 'desc' })
        .then((postagens) => {
            res.render("admin/postagens", { postagens: postagens.map(postagens => postagens.toJSON()) })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao lista postagem")
            res.redirect("/admin")
        })
})

router.get("/postagens/add", (req, res) => {
    Categoria.find().then((categorias) => {
        res.render("admin/addpostagem", { categorias: categorias.map(categorias => categorias.toJSON()) })
    }).catch((err) => {
        req.flash("error_msg)", "Houve um erro ao carregar categoria")
        res.redirect("/admim")
    })
})

router.post('/postagens/nova', (req, res) => {
    var erros = []
    if (req.body.categoria == '0') {
        erros.push({ texto: "Categoria inválida, registre uma categoria" })
    }
    if (erros.length > 0) {
        res.render("admin/addpostagem", { erros, erros })
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categorias,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro durante salvamento da postagem")
            res.redirect("/admin/postagens")
        })
    }
})

router.get("/postagem/edit/:id", (req, res) => {
    Postagem.findOne({ _id: req.params.id })
        .then((postagem) => {
            Categoria.find()
                .then((categorias) => {
                    res.render("admin/editpostagem", { categorias: categorias.map(categorias => categorias.toJSON()), postagem: postagem.toJSON() });

                })
                .catch((err) => {
                    req.flash("error_msg", "Houve um erro ao listar as catgorias")
                    //res.redirect("/admin/postagem")
                })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao carregar formulário de edição")
            //res.redirect("/admin")
        })

})

router.post("/postagem/edit", (req, res) => {
    console.log(req.body)
    Postagem.findOne({ _id: req.body.id })
        .then((postagem) => {

            postagem.titulo = req.body.titulo
            postagem.slug = req.body.slug
            postagem.descricao = req.body.descricao
            postagem.conteudo = req.body.conteudo
            postagem.categoria = req.body.categorias

            postagem.save()
                .then(() => {
                    req.flash("success_msg", "Postagem editada com sucesso")
                    res.redirect("/admin/postagens")
                }).catch((err) => {
                    req.flash("error_msg", "Erro interno")
                    console.log(err)
                    res.redirect("/admin/postagem")
                })
        })
        .catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar edição")
                / res.redirect("/admin/postagens")
        })
})

router.get("/postagem/deletar/:id", (req, res) => {
    Postagem.remove({ _id: req.params.id })
        .then(() => {
            req.flash("success_msg","Postagem deletada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            req.flash("error_msg","Houve um erro ao  deletar postagem")
            res.redirect("/admin/postagens")
        })
})

module.exports = router