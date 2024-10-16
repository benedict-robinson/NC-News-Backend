const db = require("../../db/connection.js")

exports.selectUsers = (username) => {
    if (Number(username)) {
        return Promise.reject({status: 400, msg: "Bad Request"})
    }
    const usersQuery = [`SELECT username, name, avatar_url FROM users`]
    if (username) {
        usersQuery.push(` WHERE username = '${username}';`)
    }
    else if (!username) {
        usersQuery.push(` ORDER BY username;`)
    }

    return db.query(usersQuery.join(""))
    .then(({rows}) => {
        if (rows.length < 1) {
            return Promise.reject({status: 404, msg: "User Not Found"})
        }
        return rows
    })
}