const db = require("../../db/connection.js")
const format = require("pg-format")
const { convertTimestampToDate } = require("../../db/seeds/utils.js")
const { selectArticleById } = require("./get-article-by-id-model.js")

exports.insertComment = (id, bodyArg, authorArg) => {
    if (!bodyArg || !authorArg) {
        return Promise.reject({status: 400, msg: "Bad Request"})
    }
    return db.query(`SELECT article_id FROM articles WHERE article_id = $1;`, [id])
    .then(({rows}) => {
        if (rows.length === 0) {
            return Promise.reject({ status:404, msg: "Not Found"})
        }
        
        const { created_at } = convertTimestampToDate({created_at: Date.now()})
        const formattedComment = [[bodyArg, 0, authorArg, id, created_at]]

        const postQuery = format(`INSERT INTO comments (body, votes, author, article_id, created_at) VALUES %L RETURNING *;`, formattedComment)
        
        
        return db.query(postQuery)
    })
    .then(({rows}) => {
        return rows
    })
}