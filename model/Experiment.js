import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ExperimentSchema = new Schema({
  experimentName: { type: String, required: true },
  percent_participating: { type: Number, required: true },
  blacklist: { type: [String], required: true },
  active: { type: [String], required: true },
});

export default mongoose.model('Experiment', ExperimentSchema);
