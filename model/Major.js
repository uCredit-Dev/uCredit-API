const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*  
    This model refers to a student's academic major, and stores
    distribution requirements.
    Criteria symbol: 
      [C] = Course Number
      [D] = Department
      [T] = Tags
      [L] = Level
      [A] = Area
      [Y] = Before Program start term(e.g. Fall 2019)
      [N] = Part of the name of the course
      [W] = WI
*/
const majorSchema = new Schema({
  degree_name: { type: String, required: true }, //e.g. B.S. Computer Science
  department: { type: String, required: true },
  total_degree_credit: { type: Number, required: true },
  wi_credit: { type: Number, required: true },
  url: { type: String },
  distributions: [
    {
      name: { type: String, required: true },
      required_credits: { type: Number, required: true },
      min_credits_per_course: { type: Number, required: true },
      pathing: { type: Number, default: false },
      description: { type: String, required: true },
      criteria: { type: String, required: true },
      user_select: { type: Boolean, default: false }, //if true, user can put any course into this distribution
      double_count: [{ type: String }], // whitelisted distributions that can double count; if undefined, all whitelisted
      fine_requirements: [
        {
          description: { type: String, required: true },
          required_credits: { type: Number, required: true },
          criteria: { type: String, required: true },
          double_count: [{ type: String }],
        },
      ],
    },
  ],
});

const Major = mongoose.model("Major", majorSchema);
module.exports = Major;
