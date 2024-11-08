const express = require("express")
const app = express()
const cors = require("cors")

const { getApi } = require("./controllers/api-controller.js")
const { getTopics, postTopic } = require("./controllers/topics-controller.js")
const { getArticles, getArticleById, getCommentsByArticle, patchVotesOnArticle, deleteArticle, postArticle } = require("./controllers/articles-controller.js")
const { postComment, deleteComment, patchVotesOnComment, getCommentById } = require("./controllers/comments-controller.js")
const { getUsers } = require("./controllers/users-controller.js")

app.use(cors())

app.use(express.json())

app.get("/api", getApi)

app.get("/api/topics", getTopics)

app.post("/api/topics", postTopic)

app.get("/api/articles", getArticles)

app.post("/api/articles", postArticle)

app.get("/api/users", getUsers)

app.get("/api/articles/:article_id", getArticleById)

app.get("/api/articles/:article_id/comments", getCommentsByArticle)

app.post("/api/articles/:article_id/comments", postComment)

app.patch("/api/articles/:article_id", patchVotesOnArticle)

app.get("/api/comments/:comment_id", getCommentById)

app.patch("/api/comments/:comment_id", patchVotesOnComment)

app.delete("/api/comments/:comment_id", deleteComment)

app.delete("/api/articles/:article_id", deleteArticle)

app.all("/*", (req, res) => {
    res.status(404).send({msg: "Route Not Found"})
})

app.use((err, req, res, next) => {
  if (err.code === "42703" || err.code === '22P02' || err.code === "23502") {
    res.status(400).send({msg: `Bad Request - PSQL Error ${err.code}`})
  }
  if (err.code === "23503") {
    
    const topicRegex = /topics/
    const userRegex = /users/
    if (topicRegex.test(err.detail)) {
      res.status(404).send({msg: "Topic Not Found"})
    }
    if (userRegex.test(err.detail)) {
    res.status(404).send({msg: "User Not Found"})
    }
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