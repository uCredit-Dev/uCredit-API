//routes to handle user info modification & validation
//update grade?
const express = require("express");
const router = express.Router();
const { returnData, errorHandler } = require("./helperMethods.js");
const sessions = require("../model/Session");
const users = require("../model/User");
const cookieParser = require("cookie-parser");

router.use(cookieParser());

router.get("/api/validateUser/:hash", (req, res) => {
  /*
  if (!req.cookie) {
    res.redirect("/api/login");
  } else {
    */
  const hash = req.params.hash;
  sessions.findOne(hash).then((s) => {
    if (s) {
      users
        .findById(s._id)
        .then((user) => returnData(user, res))
        .catch((err) => errorHandler(res, 500, err));
    } else {
      errorHandler(res, 401, "invalid hash");
      //res.redirect("/api/login"); //did not find any matching hash
    }
  });
});

module.exports = router;
