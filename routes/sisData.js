//routes to process sis student record(courses, advisor, major information)
import express from "express";
import { returnData, errorHandler } from "./helperMethods.js";

const router = express.Router();

router.post("/api/sis/studentRecords", (req, res) => {
  const data = req.body;
  if (!data || Object.keys(data).length === 0) {
    return errorHandler(res, 400, "Missing required fields");
  }
  returnData(data, res);
});

export default router;
