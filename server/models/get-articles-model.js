const db = require("../../db/connection.js")
const { commentCounter } = require("../../db/seeds/utils.js")
const format = require("pg-format")
const { selectTopics } = require("./get-topic-model.js")
const { selectUsers } = require("./get-users-model.js")


exports.selectArticles = (sort_by = "created_at", order = "asc", defaultOrder, topic, author) => {
    return selectUsers().then((users) => {
        const authors = users.map(user => user.username)
        return Promise.all([selectTopics(), authors])
    })
    .then((topicsAndAuthors) => {
        const rows = topicsAndAuthors[0].rows
        const authors = topicsAndAuthors[1]
        const topics = rows.map(topic => topic.slug)
        const validSortBys = ["created_at", "author", "title", "topic", "votes"]
        const validOrders = ["asc", "desc"]
        if (!validSortBys.includes(sort_by) || !validOrders.includes(order)) {
            return Promise.reject({status: 400, msg: "Bad Request - Invalid Query"})
        }
        if (!topics.includes(topic) && topic) {
            return Promise.reject({status: 404, msg: "Topic Not Found"})
        }
        if (!authors.includes(author) && author) {
            return Promise.reject({status: 404, msg: "User Not Found"})
        }
        if (!defaultOrder) {
            order = "desc"
        }
        
        let whereQuery = [""]

        if (topic || author) whereQuery.push(`WHERE `)
        if (topic) whereQuery.push(`topic = '${topic}' `)
        if (topic && author) whereQuery.push(`AND `)
        if (author) whereQuery.push(`articles.author = '${author}' `)

        const selectArticlesQuery = `SELECT articles.article_id, articles.title, articles.author, articles.topic, articles.created_at, articles.votes, articles.article_img_url, comments.comment_id
        FROM articles
        LEFT JOIN comments ON comments.article_id = articles.article_id
        ${whereQuery.join("")}
        ORDER BY ${sort_by} ${order};`
        return db.query(selectArticlesQuery)
    })
    .then(({rows}) => {
        return commentCounter(rows)
    })
}