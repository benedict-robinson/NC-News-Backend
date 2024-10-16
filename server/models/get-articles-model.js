const db = require("../../db/connection.js")
const { commentCounter } = require("../../db/seeds/utils.js")
const format = require("pg-format")

exports.selectArticles = (sort_by = "created_at", order = "asc", error, defaultOrder) => {
    const validSortBys = ["created_at", "author", "title", "topic", "votes"]
    const validOrders = ["asc", "desc"]
    if (!validSortBys.includes(sort_by) || !validOrders.includes(order)) {
        return Promise.reject({status: 406, msg: "Unaccepted Request"})
    }
    if (error) {
        return Promise.reject({status: 400, msg: "Bad Request"})
    }
    if (!defaultOrder) {
        order = "desc"
    }
    const selectArticlesQuery = `SELECT articles.article_id, articles.title, articles.author, articles.topic, articles.created_at, articles.votes, articles.article_img_url, comments.comment_id
    FROM articles
    LEFT JOIN comments ON comments.article_id = articles.article_id
    ORDER BY ${sort_by} ${order};`
    return db.query(selectArticlesQuery)
    .then(({rows}) => {
        return commentCounter(rows)
    })
}