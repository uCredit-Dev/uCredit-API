import { returnData, errorHandler } from "./helperMethods";
import express, { Request, Response } from "express";
import { Evaluation as Evaluations } from "../model_ts/Evaluation";

const router = express.Router();

//get course evaluations by course number
router.get("/api/evals/:number", async (req: Request, res: Response) => {
  const num = req.params.number;
  try {
    const review = await Evaluations.findOne({ num }).exec();
    if (!review) {
      return errorHandler(res, 404, { message: "Evaluation not found." });
    }
    returnData(review, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

export default router;
