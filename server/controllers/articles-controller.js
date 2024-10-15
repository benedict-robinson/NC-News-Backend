const { req, res } = require("express")
const { selectArticleById }= require("../models/get-article-by-id-model.js")
const { selectArticles } = require("../models/get-articles-model.js")
const { selectCommentsByArticle } = require("../models/get-comments-by-article-model.js")
const { updateVotes } = require("../models/patch-votes-by-article-id-model.js")

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

exports.getCommentsByArticle = (req, res, next) => {
    const { article_id } = req.params
    selectCommentsByArticle(article_id)
    .then((response) => {
        res.status(200).send(response)
    })
    .catch((err) => {
        next(err)
    })
}

exports.patchVotesOnArticle = (req, res, next) => {
    const { article_id } = req.params
    const { inc_vote } = req.body
    updateVotes(article_id, inc_vote).then(() => {
        selectArticleById(article_id).then((response) => {
            if (response[0].votes < 0) response[0].votes = 0
            res.status(200).send({article: response[0]})
        })
    })
    .catch((err) => {
        next(err)
    })
}