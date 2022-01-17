const Experiment = require("../model/Experiment");
const User = require("../model/User");
const ApiError = require("../model/ApiError");

class ExperimentDao {
  //When an experiment is created, it's likes and dislikes are initially 0
  async create({ name, blacklist, active }) {
    if (name === undefined || name === "") {
      throw new ApiError(400, "Every experiment must have a name!");
    }
    if (blacklist === undefined) {
      throw new ApiError(400, "Every experiment must have a blacklist list");
    }
    if (active === undefined) {
      throw new ApiError(400, "Every experiment must have an active list");
    }

    const allUsers = await User.find({}).lean().select("-__v");
    const percentConverterToInt = 100;
    const percentageOfParticipants = Math.round(
      (active.length / allUsers.length) * percentConverterToInt
    );

    const experiment = await Experiment.create({
      experimentName: name,
      likes: 0,
      dislikes: 0,
      percent_participating: percentageOfParticipants,
      blacklist: [...blacklist],
      active: [...active],
    });

    return {
      _id: experiment._id.toString(),
      experimentName: experiment.experimentName,
      likes: experiment.likes,
      dislikes: experiment.dislikes,
      percent_participating: experiment.percent_participating,
      blacklist: experiment.blacklist,
      active: experiment.active,
    };
  }

  async updateAdd(experiment_name, user_id) {
    let target = await this.findExperiment(experiment_name);
    if (target === undefined) {
      throw new ApiError(400, "There is no experiment with this name");
    }

    if (target.active.includes(user_id)) {
      throw new ApiError(400, "This user is already in the active list");
    }

    target.active.push(user_id);
    target.blacklist = target.blacklist.filter((user) => user !== user_id);

    const allUsers = await User.find({}).lean().select("-__v");
    const percentConverterToInt = 100;
    const percentageOfParticipants = Math.round(
      (target.active.length / allUsers.length) * percentConverterToInt
    );

    return Experiment.findByIdAndUpdate(
      target._id,
      {
        experimentName: target.experimentName,
        likes: target.likes,
        dislikes: target.dislikes,
        percent_participating: percentageOfParticipants,
        blacklist: target.blacklist,
        active: target.active,
      },
      { new: true, runValidators: true }
    )
      .lean()
      .select("-__v");
  }

  async updateDelete(experiment_name, user_id) {
    let target = await this.findExperiment(experiment_name);

    if (target === undefined) {
      throw new ApiError(400, "There is no experiment with this name");
    }

    if (target.blacklist.includes(user_id)) {
      throw new ApiError(400, "This user is already in the black list");
    }

    target.blacklist.push(user_id);
    target.active = target.active.filter((user) => user !== user_id);

    const allUsers = await User.find({}).lean().select("-__v");
    const percentConverterToInt = 100;
    const percentageOfParticipants = Math.round(
      (target.active.length / allUsers.length) * percentConverterToInt
    );

    return Experiment.findByIdAndUpdate(
      target._id,
      {
        experimentName: target.experimentName,
        likes: target.likes,
        dislikes: target.dislikes,
        percent_participating: percentageOfParticipants,
        blacklist: target.blacklist,
        active: target.active,
      },
      { new: true, runValidators: true }
    )
      .lean()
      .select("-__v");
  }

  async updateName(experiment_name, new_name) {
    let target = await this.findExperiment(experiment_name);
    if (target === undefined) {
      //Could not find original experiment
      throw new ApiError(
        400,
        "Fail to update experiment name that does not exist"
      );
    }

    let arr = ['', new_name];

    let updateBody = {};
    updateBody.experimentName = arr.join('');

    return Experiment.findByIdAndUpdate(target._id, updateBody, {
      new: true,
      runValidators: true,
    })
      .lean()
      .select("-__v");
  }

  async updateParticipation(experiment_name, percent_participating) {
    if (experiment_name === "White List") {
      throw new ApiError(400, "Do not update the White List using this");
    } else if (isNaN(percent_participating)) {
      throw new ApiError(400, "The percent is not a number");
    } else if (percent_participating < 0 || percent_participating > 100) {
      throw new ApiError(400, "Invalid Percentage");
    }

    const allUsers = await User.find({}).lean().select("-__v");

    const allParticipants = [];
    for (let user of allUsers) {
      allParticipants.push(user._id);
    }
    allParticipants.sort(() => Math.random() - 0.5); //Shuffling array
    if (allParticipants.length === 0) {
      throw new ApiError(
        400,
        "Seems like there is a total of 0 users in the entire website"
      );
    }

    let target = await this.findExperiment(experiment_name);
    if (target === undefined) {
      //If could not find original experiment, then make a new one
      target = await this.create({
        name: experiment_name,
        blacklist: [],
        active: [],
      });
    }

    const percentConverterToInt = 100;
    const initialPercentageOfParticipants = Math.round(
      (target.active.length / allParticipants.length) * percentConverterToInt
    );

    if (initialPercentageOfParticipants === percent_participating) {
      return target; //Same percentage, don't need to do anything
    }

    let needToIncrease =
      initialPercentageOfParticipants < percent_participating;

    for (const jhed of allParticipants) {
      if (
        !this.removeOrAddUser(
          jhed,
          needToIncrease,
          target,
          allParticipants,
          percent_participating
        )
      ) {
        break;
      }
    }

    const finalPercentageOfParticipants = Math.round(
      (target.active.length / allParticipants.length) * percentConverterToInt
    );

    return Experiment.findByIdAndUpdate(
      target._id,
      {
        experimentName: target.experimentName,
        likes: target.likes,
        dislikes: target.dislikes,
        percent_participating: finalPercentageOfParticipants,
        blacklist: target.blacklist,
        active: target.active,
      },
      { new: true, runValidators: true }
    )
      .lean()
      .select("-__v");
  }

  async removeOrAddUser(
    jhed,
    needToIncrease,
    target,
    allParticipants,
    percent_participating
  ) {
    const percentConverterToInt = 100;

    //This variable represents the current percentage of people participating in an experiment
    //Helps with deciding if an experiment reaches the precentage of 10%, 15%, etc
    const runningPercentageOfParticipants = Math.round(
      (target.active.length / allParticipants.length) * percentConverterToInt
    );

    if (needToIncrease) {
      if (runningPercentageOfParticipants >= percent_participating) {
        return false;
      }
      //Does not randomize the lists, only adds
      if (!target.blacklist.includes(jhed) && !target.active.includes(jhed)) {
        target.active.push(jhed);
      }
    } else {
      if (runningPercentageOfParticipants <= percent_participating) {
        return false;
      }
      //Does not randomize the lists, only removes
      target.active.splice(Math.floor(Math.random() * target.active.length), 1);
    }
    return true;
  }

  async findExperiment(experiment_name) {
    let data = await Experiment.find({}).lean().select("-__v");

    let lowerCaseExperiment = experiment_name.toLowerCase();
    let target;
    for (const experiment of data) {
      if (lowerCaseExperiment === experiment.experimentName.toLowerCase()) {
        target = experiment;
      }
    }
    return target;
  }

  async readAll({ user_id }) {
    const experiments = await Experiment.find({}).lean().select("-__v");
    let filteredExperiment = [];
    if (user_id) {
      for (const experiment of experiments) {
        if (experiment.active.includes(user_id)) {
          filteredExperiment.push(experiment.experimentName);
        }
      }
    }

    return filteredExperiment;
  }
}

module.exports = ExperimentDao;
