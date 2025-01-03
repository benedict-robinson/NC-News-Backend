const db = require("../../db/connection.js")

exports.updateUser = (arr, username) => {
    const updateQuery = `UPDATE users SET name = $1, avatar_url = $2 WHERE username = $3 RETURNING *;`
    const parameters = [...arr, username]
    return db.query(updateQuery, parameters)
}