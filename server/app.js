const express = require("express")
const app = express()

const { getApi } = require("./controllers/api-controller.js")
const { getTopics, postTopic } = require("./controllers/topics-controller.js")
const { getArticles, getArticleById, getCommentsByArticle, patchVotesOnArticle, deleteArticle } = require("./controllers/articles-controller.js")
const { postComment, deleteComment } = require("./controllers/comments-controller.js")
const { getUsers } = require("./controllers/users-controller.js")

app.use(express.json())

app.get("/api", getApi)

app.get("/api/topics", getTopics)

app.post("/api/topics", postTopic)

app.get("/api/articles", getArticles)

app.get("/api/users", getUsers)

app.get("/api/articles/:article_id", getArticleById)

app.get("/api/articles/:article_id/comments", getCommentsByArticle)

app.post("/api/articles/:article_id/comments", postComment)

app.patch("/api/articles/:article_id", patchVotesOnArticle)

app.delete("/api/comments/:comment_id", deleteComment)

app.delete("/api/articles/:article_id", deleteArticle)

app.all("/*", (req, res) => {
    res.status(404).send({msg: "Route Not Found"})
})

app.use((err, req, res, next) => {
  if (err.code === "42703" || err.code === '22P02' || err.code === "23502") {
    res.status(400).send({msg: "Bad Request"})
  }
  if (err.code === "23503") {
    res.status(404).send({msg: "User Not Found"})
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