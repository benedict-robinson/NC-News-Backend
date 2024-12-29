const db = require("../../db/connection.js")
const { selectUsers } = require("./get-users-model.js")

exports.selectCommentsByUsername = (username) => {
    return db.query(`SELECT * FROM comments WHERE author = $1`, [username])
    .then(({rows}) => {
        const findUser = selectUsers(username)
        return Promise.all([rows, findUser])
    })
    .then((dataArr) => {
        const comments = dataArr[0]
        const user = dataArr[1]
        if (comments.length === 0 && !user) {
            return Promise.reject({status: 404, msg: "User Not Found"})
        }
        if (comments.length === 0 && user) {
            return { msg: "No Comments Yet"}
        }
        else {
            return { comments: comments}
        }
    })
} 
