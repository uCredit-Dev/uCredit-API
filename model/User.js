const { ObjectId } = require("bson");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  major: { type: String, required: true },
  freshman: [{ type: ObjectId, ref: "Course" }],
  sophomore: [{ type: ObjectId, ref: "Course" }],
  junior: [{ type: ObjectId, ref: "Course" }],
  senior: [{ type: ObjectId, ref: "Course" }],
  distributions: [{ type: ObjectId, ref: "Distribution" }],
});

userSchema.methods.getCoursesByDistribution = function (distr_id) {};

userSchema.methods.getCoursesBySemester = function () {};

const Course = mongoose.model("User", userSchema);

module.exports = User;
