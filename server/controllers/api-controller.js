const { req, res } = require("express")
const endpoints = require("../../endpoints.json")

exports.getApi = ((req, res, next) => {
    res.status(200).send({endpoints: endpoints})
  })