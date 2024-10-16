const { req, res } = require("express")
const { insertComment } = require("../models/post-comment-model.js")
const { deleteCommentById } = require("../models/delete-comment-model.js")

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

exports.deleteComment = (req, res, next) => {
    const { comment_id } = req.params
    deleteCommentById(comment_id).then(({status, msg}) => {
        res.status(status).send()
    })
    .catch((err) => {
        next(err)
    })
}