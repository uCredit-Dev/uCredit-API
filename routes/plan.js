//routes related to Plan CRUD
import {
  returnData,
  errorHandler,
  forbiddenHandler,
  missingHandler,
} from './helperMethods.js';
import {
  addPlanDistributions,
  removePlanDistributions,
} from './distributionMethods.js';
import Courses from '../model/Course.js';
import Distributions from '../model/Distribution.js';
import Users from '../model/User.js';
import Plans from '../model/Plan.js';
import Years from '../model/Year.js';
import Reviews from '../model/PlanReview.js';
import { auth } from '../util/token.js';
import express from 'express';

const router = express.Router();
const yearName = ['AP/Transfer', 'Freshman', 'Sophomore', 'Junior', 'Senior'];

const getAPI = (window) => {
  if (window.location.href.includes('http://localhost:3000')) {
    return 'http://localhost:4567/api';
  } else {
    if (window.location.href.includes('https://ucredit.me')) {
      return 'https://ucredit-api.herokuapp.com/api';
    } else {
      ('https://ucredit-dev.herokuapp.com/api');
    }
  }
};

//get plan by plan id
router.get('/api/plans/:plan_id', auth, async (req, res) => {
  const p_id = req.params.plan_id;
  try {
    const plan = await Plans.findById(p_id)
      .populate({
        path: 'year_ids',
        populate: {
          path: 'courses',
        },
      })
      .exec();
    const years = plan.year_ids;
    let result = { ...plan._doc };
    delete result.year_ids;
    result = { ...result, years };
    const reviewers = await Reviews.find({ plan_id: p_id })
      .populate('reviewer_id')
      .exec();
    result = { ...result, reviewers };
    returnData(result, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

//get all plans of a user
router.get('/api/plansByUser/:user_id', auth, async (req, res) => {
  const user_id = req.params.user_id;
  if (req.user._id !== user_id) {
    return forbiddenHandler(res);
  }
  try {
    const plansTotal = [];
    const user = await Users.findById(user_id).exec();
    if (!user)
      return errorHandler(res, 404, {
        message: `${user} of ${user_id} User not found`,
      });
    let total = user.plan_ids.length;
    for (let plan_id of user.plan_ids) {
      let plan = await Plans.findById(plan_id).populate('year_ids').exec();
      if (!plan) {
        total--;
        continue;
      }
      plan.populate('year_ids.courses', async () => {
        plan = { ...plan._doc, years: plan.year_ids };
        delete plan.year_ids;
        const reviewers = await Reviews.find({ plan_id: plan_id })
          .populate('reviewer_id')
          .exec();
        plan = { ...plan, reviewers };
        plansTotal.push(plan);
        if (plansTotal.length === total) {
          returnData(plansTotal, res);
        }
      });
    }
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

//create plan and add the plan id to user
//require user_id in body
router.post('/api/plans', auth, async (req, res) => {
  if (!req.body.user_id) {
    return missingHandler(res, { user_id: req.body.user_id });
  }
  const planBody = {
    name: req.body.name,
    user_id: req.body.user_id,
    major_ids: req.body.major_ids,
    expireAt: req.body.expireAt,
  };
  const year = req.body.year;
  const numYears = !req.params.numYears ? 5 : req.params.numYears;
  if (numYears <= 0 || numYears > 5) {
    return errorHandler(res, 400, 'numYear must be between 1-5');
  }
  if (planBody.user_id !== req.user._id) {
    return forbiddenHandler(res);
  }
  try {
    const plan = await Plans.create(planBody);
    //update user
    // add distributions for selected major(s)
    await addPlanDistributions(plan);
    await Users.findByIdAndUpdate(
      plan.user_id,
      { $push: { plan_ids: plan._id } },
      { new: true, runValidators: true },
    ).exec();
    //create default year documents according to numYears
    const years = [];
    for (let i = 0; i < numYears; i++) {
      const yearBody = {
        name: yearName[i],
        plan_id: plan._id,
        user_id: plan.user_id,
        year: i === 0 ? 0 : getStartYear(year) + i,
        expireAt: plan.user_id === 'guestUser' ? Date.now() : undefined,
      };
      const newYear = await Years.create(yearBody);
      years.push(newYear);
      plan.year_ids.push(newYear._id);
    }
    await plan.save();
    const resp = {
      ...plan._doc,
      years,
      reviewers: [],
    };
    delete resp.year_ids;
    returnData(resp, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

const getStartYear = (year) => {
  const date = new Date();
  if (
    (year.includes('Sophomore') && date.getMonth() > 7) ||
    (year.includes('Freshman') && date.getMonth() >= 0 && date.getMonth() <= 7)
  ) {
    return date.getFullYear() - 2;
  } else if (
    (year.includes('Junior') && date.getMonth() > 7) ||
    (year.includes('Sophomore') && date.getMonth() >= 0 && date.getMonth() <= 7)
  ) {
    return date.getFullYear() - 3;
  } else if (
    (year.includes('Senior') && date.getMonth() > 7) ||
    (year.includes('Junior') && date.getMonth() >= 0 && date.getMonth() <= 7)
  ) {
    return date.getFullYear() - 4;
  } else if (
    year.includes('Senior') &&
    date.getMonth() >= 0 &&
    date.getMonth() <= 7
  ) {
    return date.getFullYear() - 5;
  } else {
    return date.getFullYear() - 1;
  }
};

//delete a plan and its years, distributions and courses
//return deleted courses
router.delete('/api/plans/:plan_id', auth, async (req, res) => {
  const plan_id = req.params.plan_id;
  try {
    // check plan belongs to user
    const plan = await Plans.findById(plan_id).exec();
    if (req.user._id !== plan.user_id) {
      return forbiddenHandler(res);
    }
    // delete plan
    await Plans.findByIdAndDelete(plan_id).exec();
    //delete distribution & courses
    await Distributions.deleteMany({ plan_id: plan._id }).exec();
    await Courses.deleteMany({ plan_id: plan._id }).exec();
    await Years.deleteMany({ plan_id: plan._id }).exec();
    await Reviews.deleteMany({ plan_id: plan._id }).exec();
    await Users.findByIdAndUpdate(
      //delete plan_id from user
      plan.user_id,
      { $pull: { plan_ids: plan._id } },
      { new: true, runValidators: true },
    ).exec();
    returnData(plan, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

//***need to consider not allow user to change major for a plan ***/
router.patch('/api/plans/update', auth, async (req, res) => {
  const id = req.body.plan_id;
  const majors = req.body.majors;
  const name = req.body.name;
  if (!id || (!majors && !name)) {
    return missingHandler(res, { id, majors, name });
  }
  let updateBody = {};
  if (majors) {
    updateBody.major_ids = majors;
  }
  if (name) {
    updateBody.name = name;
  }
  try {
    // check plan belongs to user
    let plan = await Plans.findById(plan_id).exec();
    if (req.user._id !== plan.user_id) {
      return forbiddenHandler(res);
    }
    // update plan
    plan = await Plans.findByIdAndUpdate(plan_id, updateBody, {
      new: true,
      runValidators: true,
    }).exec();
    if (majors) {
      await addPlanDistributions(plan);
      await removePlanDistributions(plan);
    }

    // return plan with reviews and distributions
    const reviewers = await Reviews.find({ plan_id })
      .populate('reviewer_id')
      .exec();
    plan = { ...plan, reviewers };
    returnData(plan, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

export default router;
