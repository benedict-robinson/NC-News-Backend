const { req, res } = require("express")
const { selectTopics } = require("../models/get-topic-model.js")


exports.getTopics = (req, res, next) => {
    selectTopics().then(({rows}) => {
        res.status(200).send({topics: rows})
    })
    .catch((err) => {
        next(err)
    })
}