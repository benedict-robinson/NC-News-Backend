const { req, res } = require("express")
const { selectArticleById }= require("../models/get-article-by-id-model.js")
const { selectArticles } = require("../models/get-articles-model.js")

exports.getArticles = (req, res, next) => {
    selectArticles().then((response) => {
        res.status(200).send({articles: response})
    })
    .catch((err) => {
        next(err)
    })

}

exports.getArticleById = (req, res, next) => {
    const { article_id} = req.params
    selectArticleById(article_id).then((response) => {
        res.status(200).send({article: response[0]})
    })
    .catch((err) => {
        next(err)
    })
}