import { returnData, errorHandler, missingHandler } from './helperMethods.js';
import Evaluations from '../model/Evaluation.js';
import express from 'express';

const router = express.Router();

//get course evaluations by course number
router.get('/api/evals/:number', async (req, res) => {
  const num = req.params.number;
  try {
    const review = await Evaluations.findOne({ num }).exec();
    if (!review) {
      return errorHandler(res, 404, { message: 'Evaluation not found.' });
    }
    returnData(review, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

export default router;
