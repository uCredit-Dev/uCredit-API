const { returnData, errorHandler } = require("./helperMethods.js");
const users = require("../model/User.js");

const express = require("express");
const router = express.Router();

router.get("/api/user", (req, res) => {
  const username = req.query.username || "";
  const affiliation = req.query.affiliation || "";
  const query = {
    $or: [
      { _id: { $regex: username, $options: "i" } },
      { name: { $regex: username, $options: "i" } },
    ],
    affiliation: { $regex: affiliation, $options: "i" },
  };
  users
    .find(query)
    .then((users) => {
      returnData(
        users.map((user) => ({
          _id: user._id,
          name: user.name,
          email: user.email,
          affiliation: user.affiliation,
          school: user.school,
          grade: user.grade,
          whitelisted_plan_ids: user.whitelisted_plan_ids,
        })),
        res
      );
    })
    .catch((err) => errorHandler(res, 400, err));
});
// derp
module.exports = router;
