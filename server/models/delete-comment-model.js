const db = require("../../db/connection.js")

exports.deleteCommentById = (id) => {
    return db.query(`SELECT comment_id FROM comments;`)
    .then(({rows}) => {
        const commentIds = rows.map(comment => {
            return comment.comment_id
        })
        if (!commentIds.includes(Number(id)) && Number(id)) {
            return Promise.reject({ status:404, msg: "Comment Not Found"})
        }
    const deleteQuery = `DELETE FROM comments
    WHERE comment_id = $1;`
    return db.query(deleteQuery, [id])
    })
    .then(({rows})=> {
        return {status: 204}
    })
}