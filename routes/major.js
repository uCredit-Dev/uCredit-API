import Majors from '../model/Major.js';
import { returnData, errorHandler, missingHandler } from './helperMethods.js';
import express from 'express';

const router = express.Router();

router.get('/api/majors/all', async (req, res) => {
  try {
    const allMajors = await Majors.find({}).exec();
    returnData(allMajors, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

router.post('/api/majors', async (req, res) => {
  const major = req.body;
  if (!major || Object.keys(major).length === 0) {
    return missingHandler(res, { major });
  }
  try {
    const newMajor = await Majors.create(major);
    returnData(newMajor, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

export default router;
