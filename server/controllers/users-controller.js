const { req, res } = require("express");
const { selectUsers } = require("../models/get-users-model.js");
const {
  selectCommentsByUsername,
} = require("../models/get-comments-by-user.js");
const db = require("../../db/connection.js");
const { response } = require("../app.js");
const { updateUser } = require("../models/patch-user.js");

exports.getUsers = (req, res, next) => {
  const { username } = req.query;
  selectUsers(username)
    .then((response) => {
      if (response.length === 1) {
        res.status(200).send({ user: response[0] });
      } else {
        res.status(200).send({ users: response });
      }
    })
    .catch((err) => {
      next(err);
    });
};

exports.getCommentsByUsername = (req, res, next) => {
  const { username } = req.params;
  selectCommentsByUsername(username)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchUser = (req, res, next) => {
  const { username } = req.params;
  const newUser = req.body;
  const userArr = [];
  for (const key in newUser) {
    if (key === "name") {
      userArr[0] = newUser[key];
    }
    if (key === "avatar_url") {
      userArr[1] = newUser[key];
    }
  }
  updateUser(userArr, username)
    .then(({ rows }) => {
      res.status(200).send({ user: rows[0] });
    })
    .catch((err) => {
      next(err);
    });
};
