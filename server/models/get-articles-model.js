const db = require("../../db/connection.js")
const { commentCounter } = require("../../db/seeds/utils.js")
const format = require("pg-format")

exports.selectArticles = () => {
    const addCommentsQuery = `SELECT articles.article_id, articles.title, articles.author, articles.topic, articles.created_at, articles.votes, articles.article_img_url, comments.comment_id
    FROM articles
    LEFT JOIN comments ON comments.article_id = articles.article_id
    ORDER BY created_at DESC;
`
    return db.query(addCommentsQuery)
    .then(({rows}) => {
        return commentCounter(rows)
    })
}