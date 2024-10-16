const { req, res } = require("express")
const { selectUsers } = require("../models/get-users-model.js")

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