require("dotenv").config();
const { returnData, errorHandler } = require("./helperMethods.js");
const users = require("../model/User.js");
const plans = require("../model/Plan.js");
const { createToken, auth } = require("../util/token");
const years = require("../model/Plan.js");
const courses = require("../model/Course.js");
const distributions = require("../model/Distribution.js");
const planReviews = require("../model/PlanReview.js");

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
    .catch((err) => errorHandler(res, 400, err));
});

// TODO: Temporarily disabled for OOSE dev deployment
// if (DEBUG) {
router.get("/api/backdoor/verification/:id", (req, res) => {
  const id = req.params.id;
  users.findById(id).then(async (user) => {
    if (user) {
      const token = createToken(user);
      returnData({ user, token }, res);
    } else {
      user = {
        _id: id,
        name: id,
        email: `ucredittest@gmail.com`,
        affiliation: "STAFF",
        grade: "AE UG Freshman",
        school: "jooby hooby",
      };
      user = await users.create(user);
      const token = createToken(user);
      returnData({ user, token }, res);
    }
  });
});

router.delete("/api/user/:id", auth, async (req, res) => {
  const id = req.params.id;
  const user = await users.findByIdAndDelete(id);
  if (user) {
    await courses.deleteMany({ user_id: id });
    await distributions.deleteMany({ user_id: id });
    await years.deleteMany({ user_id: id });
    await plans.deleteMany({ user_id: id });
    await planReviews.deleteMany({ reviewee_id: id });
    res.status(204).json({});
  } else {
    errorHandler(res, 404, "User not found.");
  }
});

module.exports = router;
