const { req, res } = require("express");
const { selectUsers } = require("../models/get-users-model.js");
const {
  selectCommentsByUsername,
} = require("../models/get-comments-by-user.js");
const db = require("../../db/connection.js");
const { response } = require("../app.js");
const { updateUser } = require("../models/patch-user.js");
const { insertUser } = require("../models/post-user.js");

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
  const { name, avatar_url } = req.body;
  const userArr = [name, avatar_url];
  updateUser(userArr, username)
    .then(({ rows }) => {
      res.status(200).send({ user: rows[0] });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postUser = (req, res, next) => {
  const { username, name, avatar_url } = req.body;
  let error = false
  if (!username || !name) {
    error = true
  }
  const userArray = [username, name, ...(avatar_url ? [avatar_url] : [])];
  insertUser(userArray, error)
    .then((response) => {
      res.status(201).send({ user: response });
    })
    .catch((err) => {
      next(err);
    });
};
