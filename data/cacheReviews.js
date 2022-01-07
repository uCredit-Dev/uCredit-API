const axios = require("axios");
const db = require("./db.js");
const evaluation = require("../model/Evaluation.js");

db.connect()
  .then(() => {
    axios
      .get("https://jhu-course-rating-api.herokuapp.com/courses")
      .then((res) => {
        let evals = res.data;
        for (i = 0; i < evals.length; i++) {
          delete evals[i]._id;
        }
        evaluation.insertMany(evals).then((c) => console.log("completed"));
      })
      .catch((err) => console.log(err));
  })
  .catch((err) => console.log(err));
