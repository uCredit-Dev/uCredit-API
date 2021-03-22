const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*  
    This model refers to courses retrieved from the SIS API.
*/

const courseSchema = new Schema({
  title: { type: String, required: true },
  number: { type: String, required: true },
  areas: { type: String, required: true },
  terms: [{ type: String, required: true }],
  school: { type: String, required: true },
  department: { type: String, default: "Unspecified" },
  credits: { type: Number, required: true },
  wi: { type: Boolean, required: true },
  bio: { type: String },
  tags: [{ type: String }],
  preReq: [
    {
      title: { type: String, required: true },
      number: { type: String, required: true },
      credits: { type: String, required: true },
    },
  ],
});

const SISCourse = mongoose.model("SISCourse", courseSchema);

module.exports = SISCourse;
