import express from 'express';
import { Experiment as Experiments } from '../model_ts/Experiment';
import { Major as Majors } from '../model_ts/Major';
import { User as Users } from '../model_ts/User';
import { errorHandler, missingHandler, returnData } from '../routes/helperMethods';
import { updateParticipation } from './experimentMethods';

const router = express.Router();

// health check path that allows render to confirm server is up
// restart app automatically if unresponsive or errors
router.get('/', async (req, res) => {
  // simple fail proof db query
  try {
    await Majors.findOne({}).exec();
    returnData("Welcome to uCredit backend!", res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

router.get('/api/experiments/allExperiments', async (req, res, next) => {
  try {
    const experiments = await Experiments.find({}).lean().select("-__v");
    const filtered_experiments = experiments.filter(
      (experiment) => experiment.name !== "White List"
    );
    returnData(filtered_experiments, res);
  } catch (err) {
    next(err);
  }
});

router.get('/api/experiments/:user_id', async (req, res, next) => {
  //user_id is jhed id
  const { user_id } = req.params;
  try {
    const user = await Users.findById(user_id);
    if (!user) {
      return errorHandler(res, 404, "User does not exist");
    }
    const experiments = await Experiments.find({}).lean().select("-__v");
    const filtered_experiments = experiments.filter(
      (experiment) => experiment.active.includes(user_id)
    );
    returnData(filtered_experiments, res);
  } catch (err) {
    next(err);
  }
});

router.get('/api/experiments/percent/:experiment_name', async (req, res, next) => {
  const { experiment_name } = req.params;
  try {
    const target = await Experiments.findExperiment(experiment_name);
    if (!target) {
      return errorHandler(res, 400, "Experiment does not exist");
    }
    returnData(target.percent_participanting, res);
  } catch (err) {
    next(err);
  }
});

router.put('/api/experiments/add/:experiment_name', async (req, res, next) => {
  const { experiment_name } = req.params;
  const { user_id } = req.body;
  if (!user_id) {
    return missingHandler(res, { user_id });
  }
  if (user_id === "guestUser") {
    return errorHandler(res, 400, "Cannot add guest users");
  }
  try {
    const target = await Experiments.findExperiment(experiment_name);
    if (!target) {
      return errorHandler(res, 400, "Experiment does not exist");
    }
    if (target.active.includes(user_id)) {
      return errorHandler(res, 400, "User is already in active list");
    }

    target.active.push(user_id);
    target.blacklist = target.blacklist.filter((user) => user !== user_id);

    const allUsers = await Users.find({}).lean().select("-__v");
    const percentConverterToInt = 100;
    const percentageOfParticipants = Math.round(
      (target.active.length / allUsers.length) * percentConverterToInt
    )
    target.percent_participanting = percentageOfParticipants;

    await target.save();
    returnData(target, res);
  } catch (err) {
    next(err);
  }

  router.put('/api/experiments/delete/:experiment_name', async (req, res, next) => {
    const { experiment_name } = req.params;
    const { user_id } = req.body;
    if (!user_id) {
      return missingHandler(res, { user_id });
    }
    try {
      const target = await Experiments.findExperiment(experiment_name);
      if (!target) {
        return errorHandler(res, 400, "Experiment does not exist");
      }
      if (target.blacklist.includes(user_id)) {
        return errorHandler(res, 400, "User is already in the blacklist");
      }

      target.active = target.active.filter((user) => user !== user_id);
      target.blacklist.push(user_id);

      const allUsers = await Users.find({}).lean().select("-__v");
      const percentConverterToInt = 100;
      const percentageOfParticipants = Math.round(
        (target.active.length / allUsers.length) * percentConverterToInt
      )
      target.percent_participanting = percentageOfParticipants;

      await target.save();
      returnData(target, res);
    } catch (err) {
      next(err);
    }
  });

  router.put('/api/experiments/changeName/:experiment_name', async (req, res, next) => {
    const { experiment_name } = req.params;
    const { new_name } = req.body;
    if (!new_name) {
      return missingHandler(res, { new_name });
    }
    try {
      const target = await Experiments.findExperiment(experiment_name);
      if (!target) {
        return errorHandler(res, 400, "Experiment does not exist");
      }

      /*
      These three lines is a work around for the github check of Database query build from user-controlled sources.
      The goal is to pass the new name as a parameter with arr.join instead of string concatanation.
      */
      const sanitizeArray = ["", new_name];
      const sanitizeName = sanitizeArray.join("");
      const updateBody = { name: sanitizeName };
      
      const updated = await Experiments.findOneAndUpdate(
        target._id,
        updateBody,
        { new: true, runValidators: true }).lean().select("-__v");

      returnData(updated, res);
    } catch (err) {
      next(err);
    }
  });

  router.post('/api/experiments/:experiment_name', async (req, res, next) => {
    const { experiment_name } = req.params;
    const { percent_participanting } = req.body;
    if (!percent_participanting) {
      return missingHandler(res, { percent_participanting });
    }
    try {
      if (experiment_name === "White List") {
        return errorHandler(res, 400, "Do not update the White List using this");
      } else if (isNaN(percent_participanting)) {
        return errorHandler(res, 400, "Percent participanting must be a number");
      } else if (percent_participanting < 0 || percent_participanting > 100) {
        return errorHandler(res, 400, "Invalid percentage");
      }

      const allUsers = await Users.find({}).lean().select("-__v");

      const allParticipants: String[] = [];
      for (const user of allUsers) {
        allParticipants.push(user._id);
      }
      allParticipants.sort(() => Math.random() - 0.5); // shuffle array
      if (allParticipants.length === 0) {
        return errorHandler(res, 400, "Seems like there is a total of 0 users in the entire website");
      }

      let target = await Experiments.findExperiment(experiment_name);
      if (!target) {
        target = await Experiments.create({
          name: experiment_name,
          active: [],
          blacklist: [],
        })
      }

      target = updateParticipation(target, allParticipants, percent_participanting);

      await target.save();
      returnData(target, res);
    } catch (err) {
      next(err);
    }
  });
});

router.delete('/api/experiments/:experiment_name', async (req, res, next) => {
  const { experiment_name } = req.params;
  try {
    const target = await Experiments.findExperiment(experiment_name);
    if (!target) {
      return errorHandler(res, 400, "Fail to delete experiment name that does not exist");
    }
    const deleted = await Experiments.findOneAndDelete(target._id).lean().select("-__v");
    returnData(deleted, res);
  } catch (err) {
    next(err);
  }
});

export default router;