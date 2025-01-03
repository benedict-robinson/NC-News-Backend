const db = require("../../db/connection.js");

exports.updateUser = (arr, username) => {
  const [name, avatar_url] = arr
  const arrTrim = arr.filter(e => e)
  if (arrTrim.length === 0) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }
  return db
    .query(`SELECT * FROM users WHERE username = $1`, [username])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "User Not Found" });
      }
      const updateQuery = `UPDATE users SET ${name ? "name = $1" : "avatar_url = $1"}${name && avatar_url ? ", avatar_url = $2" : ""} WHERE username = ${name && avatar_url ? "$3" : "$2"} RETURNING *;`;
      const parameters = [...arrTrim, username];
      return db.query(updateQuery, parameters);
    });
};
