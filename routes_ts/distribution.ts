import {
  returnData,
  errorHandler,
  missingHandler,
  forbiddenHandler,
} from "./helperMethods";
import express, { Request, Response } from "express";
import { Distribution as Distributions } from "../model_ts/Distribution";
import { auth } from "../util_ts/token";
import { Plan as Plans } from "../model_ts/Plan";
import { Course as Courses } from "../model_ts/Course";

const router = express.Router();

//get distribution by id
router.get("/api/distributions/:distribution_id", auth, async (req: any, res: Response) => {
  const d_id = req.params.distribution_id;
  try {
    const distribution = await Distributions.findById(d_id).exec();
    // verify that distribution belongs to user
    if (req.user._id !== distribution?.user_id) {
      forbiddenHandler(res);
    } else {
      returnData(distribution, res);
    }
  } catch (err) {
    errorHandler(res, 400, err);
  }
});

//get all distributions in a plan
router.get("/api/distributionsByPlan/:plan_id", auth, async (req: any, res: Response) => {
  const plan_id = req.params.plan_id;
  try {
    const plan = await Plans
      .findById(plan_id)
      .populate({ path: "distribution_ids" })
      .exec();
    // verify that plan belongs to user
    if (req.user._id !== plan?.user_id) {
      forbiddenHandler(res);
    } else {
      returnData(plan?.distribution_ids, res);
    }
  } catch (err) {
    errorHandler(res, 400, err);
  }
});

//create distribution and update its plan
router.post("/api/distributions", auth, async (req: any, res: Response) => {
  const distribution = req.body;
  if (!distribution || Object.keys(distribution).length == 0) {
    return missingHandler(res, { distribution });
  }
  if (distribution.user_id !== req.user._id) {
    return forbiddenHandler(res);
  }
  try {
    const retrievedDistribution = await Distributions.create(distribution);
    await Plans
      .findByIdAndUpdate(
        //update plan
        retrievedDistribution.plan_id,
        { $push: { distribution_ids: retrievedDistribution._id } },
        { new: true, runValidators: true }
      )
      .exec();
    returnData(retrievedDistribution, res);
  } catch (err) {
    errorHandler(res, 400, err);
  }
});

//change required credit setting for distribution
router.patch("/api/distributions/updateRequiredCredits", auth, async (req: any, res: Response) => {
  const required = req.query.required;
  const id = req.query.id;
  if (!required || !id) {
    return missingHandler(res, { required, id });
  }
  try {
    const distribution = await Distributions.findById(id).exec();
    // verify that distribution belongs to user
    if (req.user._id !== distribution?.user_id) {
      return forbiddenHandler(res);
    }
    //update distribution required
    distribution!.required = Number.parseInt(required);
    //recalculate whether distribution is satisfied
    distribution!.satisfied = distribution!.planned >= distribution!.required;
    await distribution!.save();
    returnData(distribution, res);
  } catch (err) {
    errorHandler(res, 400, err);
  }
});

router.patch("/api/distributions/updateName", auth, async (req: any, res: Response) => {
  const name = req.query.name;
  const id = req.query.id;
  if (!name || !id) {
    return missingHandler(res, { name, id });
  }
  try {
    const distribution = await Distributions.findById(id).exec();
    // verify that distribution belongs to user
    if (req.user._id !== distribution?.user_id) {
      return forbiddenHandler(res);
    }
    //update distribution name
    distribution!.name = name;
    await distribution!.save();
    returnData(distribution, res);
  } catch (err) {
    errorHandler(res, 400, err);
  }
});

//delete a distribution and its associated courses(if that is the only distirbution the course belongs to) and update it's plan
//return the deleted courses
router.delete("/api/distributions/:d_id", auth, async (req: any, res: Response) => {
  const d_id = req.params.d_id;
  try {
    // verify that distribution belongs to user
    const distribution = await Distributions.findById(d_id).exec();
    if (req.user._id !== distribution?.user_id) {
      return forbiddenHandler(res);
    }
    await Distributions.findByIdAndDelete(d_id).exec();
    //update plan
    await Plans
      .findByIdAndUpdate(
        distribution!.plan_id,
        { $pull: { distribution_ids: distribution!._id } },
        { new: true, runValidators: true }
      )
      .exec();
    //delete courses that only belong to the distribution
    await Courses
      .deleteMany({
        $and: [
          { distribution_ids: distribution!._id },
          { distribution_ids: { $size: 1 } },
        ],
      })
      .exec();
    returnData(distribution, res);
  } catch (err) {
    errorHandler(res, 400, err);
  }
});

export default router;