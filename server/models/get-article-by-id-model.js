const db = require("../../db/connection.js")

exports.selectArticleById = (id) => {
    const selectByIdQuery = `SELECT article_id, title, topic, author, body, created_at::VARCHAR, votes, article_img_url FROM articles WHERE article_id = ${id};`
    return db.query(selectByIdQuery)
    .then(({rows}) => {
        if (rows.length < 1) {
            return Promise.reject({status: 404, msg: "Article Not Found"})
        }
        return rows
    })
}