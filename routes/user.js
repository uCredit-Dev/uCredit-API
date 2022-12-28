import { returnData, errorHandler, forbiddenHandler } from "./helperMethods.js";
import users from "../model/User.js";
import plans from "../model/Plan.js";
import { createToken, auth } from "../util/token.js";
import years from "../model/Plan.js";
import courses from "../model/Course.js";
import distributions from "../model/Distribution.js";
import planReviews from "../model/PlanReview.js";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const DEBUG = process.env.DEBUG === "True";

router.get("/api/user", async (req, res) => {
  const username = req.query.username || "";
  const affiliation = req.query.affiliation || "";
  const query = {
    $or: [
      { _id: { $regex: username, $options: "i" } },
      { name: { $regex: username, $options: "i" } },
    ],
    affiliation: { $regex: affiliation, $options: "i" },
  };
  try {
    let users = await users.find(query); 
    users = users.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      affiliation: user.affiliation,
      school: user.school,
      grade: user.grade,
      whitelisted_plan_ids: user.whitelisted_plan_ids,
    })); 
    returnData(users, res); 
  } catch (err) {
    errorHandler(res, 400, err); 
  }
});

// TODO: Temporarily disabled for OOSE dev deployment
// if (DEBUG) {
router.get("/api/backdoor/verification/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await users.findById(id); 
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
  } catch (err) {
    errorHandler(res, 500, err); 
  }
});

router.delete("/api/user/:id", auth, async (req, res) => {
  const id = req.params.id;
  if (req.user._id !== id) {
    return forbiddenHandler(res);
  }
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

export default router;
