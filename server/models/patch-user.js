const db = require("../../db/connection.js");

exports.updateUser = (arr, username) => {
  if (arr.length === 0) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }
  return db
    .query(`SELECT * FROM users WHERE username = $1`, [username])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "User Not Found" });
      }
      const updateQuery = `UPDATE users SET name = $1, avatar_url = $2 WHERE username = $3 RETURNING *;`;
      const parameters = [...arr, username];
      return db.query(updateQuery, parameters);
    });
};
