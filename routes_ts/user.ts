import { returnData, errorHandler, forbiddenHandler } from "./helperMethods.js";
import Users from "../model/User.js";
import Plans from "../model/Plan.js";
import { createToken, auth } from "../util/token.js";
import Years from "../model/Year.js";
import Courses from "../model/Course.js";
import Distributions from "../model/Distribution.js";
import Reviews from "../model/PlanReview.js";
import express, {Request, Response} from "express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const DEBUG = process.env.DEBUG === "True";

router.get("/api/user", async (req: Request, res: Response) => {
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
    let users = await Users.find(query).exec();
    const usersResponse = users.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      affiliation: user.affiliation,
      school: user.school,
      grade: user.grade,
      // whitelisted_plan_ids: user.whitelisted_plan_ids, //TODO: what is this?
    }));
    returnData(usersResponse, res);
  } catch (err) {
    errorHandler(res, 400, err);
  }
});

router.get("/api/backdoor/verification/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    let user = await Users.findById(id).exec();
    if (!user) {
      const body = {
        _id: id,
        name: id,
        email: `ucredittest@gmail.com`,
        affiliation: "STAFF",
        grade: "AE UG Freshman",
        school: "jooby hooby",
      };
      user = await Users.create(body);
    }
    const token = createToken(user);
    returnData({ user, token }, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

router.delete("/api/user/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  // not auth secured, but use route only for fake user ids  
  if (id !== "TEST_DEV" && id !== "REVIEWER_DEV") {
    return forbiddenHandler(res);
  }
  try {
    const user = await Users.findByIdAndDelete(id).exec();
    if (user) {
      await Courses.deleteMany({ user_id: id }).exec();
      await Distributions.deleteMany({ user_id: id }).exec();
      await Years.deleteMany({ user_id: id }).exec();
      await Plans.deleteMany({ user_id: id }).exec();
      await Reviews.deleteMany({ reviewee_id: id }).exec();
      res.status(204).json({});
    } else {
      errorHandler(res, 404, "User not found.");
    }
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

export default router;
