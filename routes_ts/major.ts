import { returnData, errorHandler, missingHandler } from "./helperMethods";
import express, { Request, Response } from "express";
import { Major as Majors } from "../model_ts/Major";

const router = express.Router();

router.get("/api/majors/all", async (req: Request, res: Response) => {
  try {
    const allMajors = await Majors.find({}).exec();
    returnData(allMajors, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

router.post("/api/majors", async (req: Request, res: Response) => {
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
