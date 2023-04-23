import mongoose from "mongoose";

/*
  Fields needed to create a new Experiment.
*/
export interface ExperimentAttrs {
  name: String;
  blacklist: String[];
  active: String[];
}

/*
  Declare fields in a created Experiment document.
*/ 
export interface ExperimentDoc extends mongoose.Document {
  name: String;
  percent_participanting: Number;
  blacklist: String[];
  active: String[];
}

interface ExperimentModel extends mongoose.Model<ExperimentDoc> {
  build(attrs: ExperimentAttrs): ExperimentDoc;
  findExperiment(experiment_name: String): Promise<ExperimentDoc>;
}

const experimentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  percent_participanting: { type: Number, required: true },
  blacklist: { type: [String], required: true },
  active: { type: [String], required: true },
});

experimentSchema.statics.build = (attrs: ExperimentAttrs) => {
  return new Experiment(attrs);
}

experimentSchema.statics.findExperiment = async (experiment_name: String) => {
  let experiments = await Experiment.find({}).select("-__v");

  let lowerCaseExperiment = experiment_name.toLowerCase();
  let target: ExperimentDoc | undefined;
  for (const experiment of experiments) {
    if (lowerCaseExperiment === experiment.name.toLowerCase()) {
      target = experiment;
    }
  }
  return target;
}

const Experiment = mongoose.model<ExperimentDoc, ExperimentModel>(
  "Experiment",
  experimentSchema
);

export { Experiment };