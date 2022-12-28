import majors from "../model/Major.js";
import { returnData, errorHandler } from "./helperMethods.js";
import express from "express";

const router = express.Router();

router.get("/api/majors/all", async (req, res) => {
  try {
    const allMajors = await majors.find({}); 
    returnData(allMajors, res); 
  } catch (err) {
    errorHandler(res, 500, err); 
  }
});

router.post("/api/majors", async (req, res) => {
  const major = req.body;
  try {
    const newMajor = await majors.create(major); 
    returnData(newMajor, res); 
  } catch (err) {
    errorHandler(res, 400, err)
  }
});

export default router;
