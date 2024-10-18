const { req, res } = require("express")
const { selectArticleById }= require("../models/get-article-by-id-model.js")
const { selectArticles } = require("../models/get-articles-model.js")
const { selectCommentsByArticle } = require("../models/get-comments-by-article-model.js")
const { updateVotes } = require("../models/patch-votes-by-article-id-model.js")
const { deleteArticleById} = require("../models/delete-article-model.js")
const { insertArticle } = require("../models/post-article.js")

exports.getArticles = (req, res, next) => {
    let error = false
    const { sort_by, order, topic, author} = req.query
    let defaultOrder = true
    if (!sort_by || sort_by === 'votes' || sort_by === 'created_at') {
        if (!order) {
            defaultOrder = false
        }
    }
    const validQueries = ['sort_by', 'order', 'topic', 'author']
    const queries = Object.keys(req.query)
    queries.forEach(query => {
        if (!validQueries.includes(query)) {
           error = true
        }
        if (Number(topic) || Number(author)) {
            error = true
        }
    })
    selectArticles(sort_by, order, error, defaultOrder, topic, author).then((response) => {
        res.status(200).send({articles: response})
    })
    .catch((err) => {
        next(err)
    })

}

exports.getArticleById = (req, res, next) => {
    const { article_id } = req.params
    const commentCount = Object.keys(req.query)[0]
    selectArticleById(article_id, commentCount).then((response) => {
    
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

exports.deleteArticle = (req, res, next) => {
    const { article_id } = req.params
    deleteArticleById(article_id).then(({status}) => {
        res.status(status).send()
    })
    .catch((err) => {
        next(err)
    })
}

exports.postArticle = (req, res, next) => {
    const articleObj = req.body
    insertArticle(articleObj)
    .then((response) => {
        res.status(201).send({article: response})
    })
    .catch((err) => {
        next(err)
    })
}