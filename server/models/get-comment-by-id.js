const db = require("../../db/connection.js")

exports.selectCommentsById = (id) => {

    const commentByIdQuery = `SELECT * FROM comments WHERE comment_id = $1`

    return db.query(commentByIdQuery, [id])
    .then(({rows}) => {
        if (rows.length === 0) {
            return Promise.reject( {status: 404, msg: "Comment Not Found"})
        }
        return rows[0]
    })
}