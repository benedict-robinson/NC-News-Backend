const { req, res } = require("express")
const { selectUsers } = require("../models/get-users-model.js")

exports.getUsers = (req, res, next) => {
    selectUsers().then((response) => {
        res.status(200).send({users: response})
    })
}