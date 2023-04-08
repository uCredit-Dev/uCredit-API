import mongoose from "mongoose";

/*
  Fields needed to create a new distribution.
*/
export interface DistributionAttrs {
  name: string;
  required: number;
  user_id: mongoose.Schema.Types.ObjectId;
  plan_id: mongoose.Schema.Types.ObjectId;
}

/*
  Declare fields in a created distribution document.
*/
export interface DistributionDoc extends mongoose.Document {
  name: string;
  required: number;
  planned: number;
  current: number;
  satisfied: boolean;
  courses?: mongoose.Schema.Types.ObjectId[];
  user_id: mongoose.Schema.Types.ObjectId;
  plan_id: mongoose.Schema.Types.ObjectId;
  expireAt?: Date;
}

interface DistributionModel extends mongoose.Model<DistributionDoc> {
  build(attrs: DistributionAttrs): DistributionDoc;
}

/*  
    This model refers to distribution requirements set by the specific major.
    Potential names are: overall, humanity, basic science, core, 
    writing-intensive, team, focus-area, etc.
    If a course is an elective, it counts toward the overall category.
    Distribution must belong to a plan.
*/
const distributionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  required: { type: Number, required: true },
  planned: { type: Number, default: 0 },
  current: { type: Number, default: 0 },
  satisfied: { type: Boolean, default: false },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  user_id: { type: String, required: true },
  plan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  expireAt: { type: Date, expires: 60 * 60 * 24 },
});

const Distribution = mongoose.model<DistributionDoc, DistributionModel>(
  "Distribution",
  distributionSchema
);

distributionSchema.statics.findByName = function (
  name: String,
  user_id: mongoose.Schema.Types.ObjectId
): DistributionDoc {
  return this.find({ name, user_id });
};

// distributionSchema.statics.removeCourse = function (course_id: mongoose.Schema.Types.ObjectId, user_id: mongoose.Schema.Types.ObjectId) {};

// distributionSchema.statics.modifyCredits = function (field, value, user_id) {};

export { Distribution };
