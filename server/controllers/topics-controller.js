const { req, res } = require("express")
const { selectTopics } = require("../models/get-topic-model.js")
const { insertTopic } = require("../models/post-topic-model.js")

exports.getTopics = (req, res, next) => {
    selectTopics().then(({rows}) => {
        res.status(200).send({topics: rows})
    })
    .catch((err) => {
        next(err)
    })
}

exports.postTopic = (req, res, next) => {
    const { slug, description, created_by } = req.body
    insertTopic(slug, description, created_by)
    .then((response) => {
        res.status(201).send({topic: response})
    })
    .catch((err) => {
        next(err)
    })
}