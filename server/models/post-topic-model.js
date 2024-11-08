const db = require("../../db/connection.js")
const format = require("pg-format")

exports.insertTopic = (slug, description, created_by) => {
    const insertTopicQuery = format(`INSERT INTO topics 
        (slug, description, created_by) VALUES %L RETURNING *;`, [[slug, description, created_by]])
    
    return db.query(insertTopicQuery)
    .then(({rows}) => {
        return rows[0]
    })
}