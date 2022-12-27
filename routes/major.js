import majors from "../model/Major.js";
import { returnData, errorHandler } from "./helperMethods.js";
import express from "express";

const router = express.Router();

router.get("/api/majors/all", (req, res) => {
  majors
    .find({})
    .then((major) => returnData(major, res))
    .catch((err) => errorHandler(res, 500, err));
});

router.post("/api/majors", async (req, res) => {
  const major = req.body;
  majors
    .create(major)
    .then((major) => {
      returnData(major, res);
    })
    .catch((err) => errorHandler(res, 400, err));
});

export default router;
