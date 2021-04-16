//routes to handle user info modification & validation
//update grade?
const express = require("express");
const router = express.Router();
const { returnData, errorHandler } = require("./helperMethods.js");
const sessions = require("../model/Session");
const users = require("../model/User");
const cookieParser = require("cookie-parser");

router.use(cookieParser());

router.get("/api/retrieveUser", (req, res) => {
  if (!req.user) {
    errorHandler(res, 401, "Not logged in");
  }
  returnData(req.user.uid, res);
  /*
  users
    .findById(req.user.uid)
    .then((user) => returnData(user, res))
    .catch((err) => errorHandler(res, 500, err));
    */
});

module.exports = router;
