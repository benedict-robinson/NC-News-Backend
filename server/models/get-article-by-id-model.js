const db = require("../../db/connection.js")
const { selectArticles } = require("./get-articles-model.js")

exports.selectArticleById = (id, commentCount) => {
    if (commentCount === "comment_count") {
        return selectArticles()
        .then((articles) => {
            const selectedArticle = articles.filter(article => {
                return article.article_id === Number(id)
            })[0]
            const selectedArticleBodyQuery = `SELECT body, created_at::VARCHAR FROM articles WHERE article_id = $1;`
            
            return Promise.all([db.query(selectedArticleBodyQuery, [id]), selectedArticle])
        })
        .then((responses) => {
            const selectedArticleBody = responses[0].rows[0].body
            const varCharDate = responses[0].rows[0].created_at
            const article = responses[1]

            article.body = selectedArticleBody
            article.created_at = varCharDate
            
            return [article]
        })
    }
    const selectByIdQuery = `SELECT article_id, title, topic, author, body, created_at::VARCHAR, votes, article_img_url FROM articles WHERE article_id = $1;`
    
    if (!Number(id)) {
        return Promise.reject({status: 400, msg: "Bad Request"})
    }
    return db.query(selectByIdQuery, [id])
    .then(({rows}) => {
        if (rows.length < 1) {
            return Promise.reject({status: 404, msg: "Article Not Found"})
        }
        return rows
    })
}