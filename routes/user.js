const { returnData, errorHandler } = require("./helperMethods.js");
const users = require("../model/User.js");
const plans = require("../model/Plan.js");
const { createToken, auth } = require("../util/token");

const express = require("express");
const router = express.Router();

const DEBUG = process.env.DEBUG === "True";

router.get("/api/user", auth, (req, res) => {
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
    .catch((err) => errorHandler(err));
});

// TODO: Temporarily disabled for OOSE dev deployment
// if (DEBUG) {
router.get("/api/backdoor/verification/:id", (req, res) => {
  const id = req.params.id;
  users
    .findById(id)
    .then(async (user) => {
      if (!user) {
        user = {
          _id: id,
          name: id,
          email: `${id}@fakeemail.com`,
          affiliation: "ADMIN",
          grade: "AE UG Freshman",
          school: "jooby hooby",
        };
        user = await users.create(user);
      }
      const token = createToken(user);
      returnData({ user, token }, res);
    })
    .catch((err) => errorHandler(res, 500, err));
});

router.delete("/api/user/:id", auth, (req, res) => {
  if (req.user.affiliation != "ADMIN") {
    errorHandler(res, 403, "Only Admin can access this route.");
  } else {
    const id = req.params.id;
    users.findByIdAndDelete(id).then((user) => {
      if (user) {
        plans.deleteMany({ user_id: id }).exec();
        returnData(user, res);
      } else {
        errorHandler(res, 404, "User not found.");
      }
    });
  }
});

module.exports = router;
