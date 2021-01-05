const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*  
    This model refers to distribution requirements set by the specific major.
    Potential names are: overall, humanity, basic science, core, 
    writing-intensive, team, focus-area, etc.
*/
const distributionSchema = new Schema({
  name: String,
  required: Number,
  current: Number,
  courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
});

const Distribution = mongoose.model("Distribution", distributionSchema);

module.exports = Distribution;
