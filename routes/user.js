//routes to handle user info modification & validation
//update grade?

const users = require("../model/User.js");
const { returnData, errorHandler } = require("./helperMethods.js");

const express = require("express");
const router = express.Router();

router.get("/api/users/all", (req, res) => {
  users
    .find({})
    .then((user) => returnData(user, res))
    .catch((err) => errorHandler(res, 500, err));
});

module.exports = router;