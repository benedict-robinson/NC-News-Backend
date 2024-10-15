const { req, res } = require("express")
const { insertComment } = require("../models/post-comment-model.js")

exports.postComment = (req, res, next) => {
    const { body, author } = req.body
    const { article_id } = req.params
    insertComment(article_id, body, author)
    .then((response) => {
        const comment = response[0]
        res.status(201).send({comment: comment})
    })
    .catch((err) => {
        next(err)
    })
    
}