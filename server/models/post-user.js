const db = require("../../db/connection.js");
const format = require("pg-format");

exports.insertUser = (userArr, error) => {
  if (error) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request - Missing Required Data",
    });
  }
  const avatarQuery = userArr.length === 3 ? ", avatar_url" : "";
  const insertUserQuery = format(
    `INSERT INTO users (
            username, name${avatarQuery})
            VALUES %L RETURNING *;`,
    [userArr]
  );
  return db.query(insertUserQuery).then(({ rows }) => {
    return rows[0];
  });
};
