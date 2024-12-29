const { req, res } = require("express")
const { selectUsers } = require("../models/get-users-model.js")
const { selectCommentsByUsername } = require("../models/get-comments-by-user.js")
const db = require("../../db/connection.js")
const { response } = require("../app.js")

exports.getUsers = (req, res, next) => {
    const { username } = req.query
    selectUsers(username).then((response) => {
        if (response.length === 1) {
            res.status(200).send({user: response[0]})
        }
        else {
        res.status(200).send({users: response})
        }
    })
    .catch((err) => {
        next(err)
    })
}

exports.getCommentsByUsername = (req, res, next ) => {
    const { username } = req.params
    selectCommentsByUsername(username).then((response) => {
        res.status(200).send(response)
    })
    .catch((err) => {
        next(err)
    })
}