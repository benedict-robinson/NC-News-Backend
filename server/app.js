const express = require("express")
const app = express()
const endpoints = require("../endpoints.json")

const { getTopics } = require("./controllers/topics-controller.js")

app.get("/api", (req, res, next) => {
  res.status(200).send({endpoints: endpoints})
})

app.get("/api/topics", getTopics)

app.use("/*", (req, res) => {
    res.status(404).send({msg: "Route Not Found"})
})


app.use((err, req, res, next) => {
    res.status(500).send({ msg: "Internal server error" });
  });

module.exports = app