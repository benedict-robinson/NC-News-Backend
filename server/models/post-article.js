const db = require("../../db/connection.js")
const { convertTimestampToDate } = require("../../db/seeds/utils.js")
const format = require("pg-format")

exports.insertArticle = (articleObj) => {

    const formattedArticleObj = convertTimestampToDate(articleObj)

    const {title, topic, author, body, created_at, votes, article_img_url} = formattedArticleObj
    const articleArray = [title, topic, author, body, created_at, votes]

    if (article_img_url) articleArray.push(article_img_url)
    else {
        articleArray.push('https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700')
    }
    const insertArticleQuery = format(`INSERT INTO articles (
        title, topic, author, body, created_at, votes, article_img_url)
        VALUES %L RETURNING *;`, [articleArray])

    return db.query(insertArticleQuery)
    .then(({rows}) => {
        return rows[0]
    })
    
}