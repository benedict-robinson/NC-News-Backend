const db = require("../../db/connection.js")
const format = require("pg-format")

exports.insertTopic = (slug, description) => {
    
    const insertTopicQuery = format(`INSERT INTO topics 
        (slug, description) VALUES %L RETURNING *;`, [[slug, description]])
    
    return db.query(insertTopicQuery)
    .then(({rows}) => {
        return rows[0]
    })
}