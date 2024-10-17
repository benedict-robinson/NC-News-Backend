const db = require("../../db/connection.js")
const { response } = require("../app.js")

exports.deleteArticleById = (id) => {
    return db.query(`SELECT article_id FROM articles;`)
    .then(({rows}) => {
        const articleIds = rows.map(article => {
            return article.article_id
        })
        if (!articleIds.includes(Number(id)) && Number(id)) {
            return Promise.reject({ status:404, msg: "Not Found"})
        }
    const deleteQuery = `DELETE FROM articles
    WHERE article_id = $1;`
    return db.query(deleteQuery, [id])
    })
    .then((response)=> {
        return {status: 204}
    })
}