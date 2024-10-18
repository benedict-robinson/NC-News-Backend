const { req, res } = require("express")
const { insertComment } = require("../models/post-comment-model.js")
const { deleteCommentById } = require("../models/delete-comment-model.js")
const { updateCommentVotes } = require("../models/patch-votes-by-comment-id-model.js")
const { response } = require("../app.js")

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

exports.patchVotesOnComment = (req, res, next) => {
    const { comment_id } = req.params
    const { inc_vote } = req.body

    updateCommentVotes(comment_id, inc_vote)
    .then((response) => {
        res.status(200).send({comment: response})
    })
    .catch((err) => {
        next(err)
    })
}