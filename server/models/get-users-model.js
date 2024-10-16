const db = require("../../db/connection.js")

exports.selectUsers = () => {
    const usersQuery = `SELECT username, name, avatar_url FROM users 
    ORDER BY username;`

    return db.query(usersQuery)
    .then(({rows}) => {
        return rows
    })
}