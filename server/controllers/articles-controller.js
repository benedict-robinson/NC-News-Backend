const { req, res } = require("express")
const { selectArticleById }= require("../models/get-article-by-id-model.js")

exports.getArticleById = (req, res, next) => {
    const { article_id} = req.params
    selectArticleById(article_id).then((response) => {
        res.status(200).send({article: response[0]})
    })
    .catch((err) => {
        next(err)
    })
}