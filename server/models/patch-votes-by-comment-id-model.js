const db = require("../../db/connection.js")

exports.updateCommentVotes = (id, num) => {
    return db.query(`SELECT * FROM comments WHERE comment_id = $1`, [id])
    .then(({rows}) => {
        if (rows.length < 1) {
            return Promise.reject({status: 404, msg: "Not Found"})
        }
        const updateQuery = `UPDATE comments SET votes = votes + $1 
    WHERE comment_id = $2 RETURNING *;`
    const parameters = [num, id]
    return db.query(updateQuery, parameters)
    .then(({rows}) => {
        return rows[0]
    })
    })
    
}