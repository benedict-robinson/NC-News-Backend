const db = require("../../db/connection.js")

exports.updateVotes = (id, num) => {
    return db.query(`SELECT article_id FROM articles;`)
    .then(({rows}) => {
        const articleIds = rows.map(article => {
            return article.article_id
        })
        if (!articleIds.includes(Number(id)) && Number(id)) {
            return Promise.reject({ status:404, msg: "Article Not Found"})
        }
    const updateQuery = `UPDATE articles SET votes = votes + $1 
    WHERE article_id = $2 RETURNING *;`
    const parameters = [num, id]
    return db.query(updateQuery, parameters)
    })
}

