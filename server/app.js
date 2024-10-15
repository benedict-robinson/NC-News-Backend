const express = require("express")
const app = express()

const { getApi } = require("./controllers/api-controller.js")
const { getTopics } = require("./controllers/topics-controller.js")
const { getArticles, getArticleById } = require("./controllers/articles-controller.js")

app.get("/api", getApi)

app.get("/api/topics", getTopics)

app.get("/api/articles", getArticles)

app.get("/api/articles/:article_id", getArticleById)

app.all("/*", (req, res) => {
    res.status(404).send({msg: "Route Not Found"})
})

app.use((err, req, res, next) => {
  if (err.code === "42703") {
    res.status(400).send({msg: "Bad Request"})
  }
  else {
    next(err)
  }
})

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({msg: err.msg})
  }
  else {
    next(err)
  }
})

app.use((err, req, res, next) => {
    res.status(500).send({ msg: "Internal server error" });
  });

module.exports = app