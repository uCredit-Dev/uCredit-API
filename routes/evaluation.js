import { returnData, errorHandler } from "./helperMethods.js";
import evaluation from "../model/Evaluation.js";
import express from "express";

const router = express.Router();

//get course evaluations by course number
router.get("/api/evals/:number", async (req, res) => {
  const num = req.params.number;
  try {
    const review = await evaluation.findOne({ num }); 
    returnData(review, res); 
  } catch (err) {
    errorHandler(res, 500, err); 
  }
});

export default router;
