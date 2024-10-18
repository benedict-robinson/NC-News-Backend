const db = require("../../db/connection.js")
const { selectArticleById } = require("./get-article-by-id-model.js")

exports.selectCommentsByArticle = (id) => {
    const selectCommentQuery = `SELECT comment_id, votes, created_at, author, body, article_id FROM comments 
    WHERE article_id = $1 
    ORDER BY created_at DESC;`
    
    return db.query(selectCommentQuery, [id])
    .then(({rows}) => {
        const findArticle = selectArticleById(id)
        return Promise.all([rows, findArticle])
    })
    .then((dataArr) => {
        const rows = dataArr[0]
        const article = dataArr[1]
        if (rows.length === 0 && !article) {
            return Promise.reject({status: 404, msg: "Article Not Found"})
        }
        if (rows.length == 0 && article) {
            return {
                comments: rows,
                msg: "No Comments Yet"
            }
        }
        else {
        return { comments: rows }
        }
    })
}