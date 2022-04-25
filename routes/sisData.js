//routes to process sis student record(courses, advisor, major information)
const express = require("express");
const router = express.Router();
const { returnData, errorHandler } = require("./helperMethods.js");

router.post("/api/sis/studentRecords", (req, res) => {
  const data = req.body;
  if (!data) {
    // FAULT
    errorHandler(res, 400, "Missing required fields");
    return;
  }
  returnData(data, res);
});

module.exports = router;
