const express = require("express");
const ExperimentDao = require("../data/ExperimentDao");
const ApiError = require("../model/ApiError");

const router = express.Router();
const experiments = new ExperimentDao();

router.get("/api/experiments/:user_id", async (req, res, next) => {
  try {
    //user_id is jhed id
    const { user_id } = req.params;
    const data = await experiments.readAll( {user_id: user_id} );
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get("/api/experiments/percent/:experiment_name", async (req, res, next) => {
  try {
    //user_id is jhed id
    const { experiment_name } = req.params;
    const data = await experiments.findExperiment(experiment_name);
    if (data === undefined) {
      res.json(0)
    } else {
      res.json(data.percent_participating);
    }
  } catch (err) {
    next(err);
  }
});

router.put("/api/experiments/add/:experiment_name", async (req, res, next) => {
  try {
    const { experiment_name } = req.params;
    const { user_id } = req.body;
    if (!user_id || !experiment_name ) {
      throw new ApiError(
        400,
        "You must provide user_id and experiment_name attribute!"
      );
    }
    if (user_id === "guestUser") {
      throw new ApiError(400, "Cannot add guest users");
    }
    const data = await experiments.updateAdd(experiment_name, user_id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.put("/api/experiments/delete/:experiment_name", async (req, res, next) => {
  try {
    const { experiment_name } = req.params;
    const { user_id } = req.body;
    if (!user_id || !experiment_name ) {
      throw new ApiError(
        400,
        "You must provide user_id and experiment_name attribute!"
      );
    }
    const data = await experiments.updateDelete(experiment_name, user_id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.post("/api/experiments/:experiment_name", async (req, res, next) => {
  try {
    const { experiment_name } = req.params;
    const { percent_participating } = req.body;
    if (percent_participating === undefined || !experiment_name ) {
      throw new ApiError(
        400,
        "You must provide percent_participating and experiment_name attribute!"
      );
    }
    const data = await experiments.updateParticipation(experiment_name, percent_participating);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
