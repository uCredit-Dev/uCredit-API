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

const Experiment = mongoose.model<ExperimentDoc, ExperimentModel>(
  "Experiment",
  experimentSchema
);

export { Experiment };