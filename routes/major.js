const majors = require("../model/Major.js");
const { returnData, errorHandler } = require("./helperMethods.js");

const express = require("express");
const router = express.Router();

router.get("/api/majors/all", (req, res) => {
    majors.find({})
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
}) ;

module.exports = router;