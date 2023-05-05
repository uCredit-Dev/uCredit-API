//routes related to distirbutions CRUD
import {
  returnData,
  errorHandler,
  forbiddenHandler,
  missingHandler,
} from './helperMethods.js';
import { auth } from '../util/token.js';
import Distributions from '../model/Distribution.js';
import Plans from '../model/Plan.js';
import Majors from '../model/Major.js';
import express from 'express';
import { initDistributions } from './distributionMethods.js';

const router = express.Router();

//get distribution by id
router.get('/api/distributions/:distribution_id', auth, async (req, res) => {
  const d_id = req.params.distribution_id;
  try {
    const distribution = await Distributions.findById(d_id)
      .populate('fineReq_ids')
      .exec();
    if (!distribution)
      return errorHandler(res, 404, { message: 'Distribution not found.' });
    returnData(distribution, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

//get all distributions in a plan
router.get('/api/distributionsByPlan/', async (req, res) => {
  const plan_id = req.query.plan_id;
  const major_id = req.query.major_id;
  if (!plan_id || !major_id) return missingHandler(res, { plan_id, major_id });
  const reload = req.query.reload;
  // verify that plan belongs to user
  try {
    const plan = await Plans.findById(plan_id).exec();
    if (!plan) return errorHandler(res, 404, { message: 'Plan not found.' });
    const major = await Majors.findById(major_id).exec();
    if (!major) return errorHandler(res, 404, { message: 'Major not found.' });
    if (reload === 'true') {
      await initDistributions(plan_id, major_id);
    }
    const distributions = await Distributions.find({
      plan_id,
      major_id,
    }).exec();
    returnData(distributions, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

//change required credit setting for distribution
router.patch(
  '/api/distributions/updateRequiredCredits',
  auth,
  async (req, res) => {
    const required = req.query.required;
    const id = req.query.id;
    if (Number.parseInt(required) === NaN || !id) {
      return missingHandler(res, { required, id });
    }
    try {
      const distribution = await Distributions.findById(id).exec();
      // verify that distribution belongs to user
      if (req.user._id !== distribution.user_id) {
        return forbiddenHandler(res);
      }
      //update distribution required
      distribution.required_credits = Number.parseInt(required);
      //recalculate whether distribution is satisfied
      distribution.satisfied =
        distribution.planned >= distribution.required_credits;
      await distribution.save();
      returnData(distribution, res);
    } catch (err) {
      errorHandler(res, 500, err);
    }
  },
);

router.patch('/api/distributions/updateName', auth, async (req, res) => {
  const name = req.query.name;
  const id = req.query.id;
  if (!name || !id) {
    return missingHandler(res, { name, id });
  }
  try {
    const distribution = await Distributions.findById(id).exec();
    // verify that distribution belongs to user
    if (req.user._id !== distribution.user_id) {
      return forbiddenHandler(res);
    }
    //update distribution name
    distribution.name = name;
    await distribution.save();
    returnData(distribution, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

export default router;
