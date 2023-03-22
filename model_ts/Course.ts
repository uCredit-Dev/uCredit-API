import mongoose from "mongoose";

export enum CourseTerm {
  fall = "fall",
  spring = "spring",
  summer = "summer",
  intersession = "intersession",
}

type PreReq = {
  Description: String;
  Expression: String;
  IsNegative: String;
};

/*
  Fields needed to create a new Course.
*/
export interface CourseAttrs {
  title: String;
  term: CourseTerm;
  year: String;
  version: String;
  number: String;
  area: String;
  preReq: PreReq[];
  credits: Number;
  isPlaceholder: Boolean;
  distribution_id: mongoose.Schema.Types.ObjectId;
  year_id: mongoose.Schema.Types.ObjectId;
  plan_id: mongoose.Schema.Types.ObjectId;
  user_id: mongoose.Schema.Types.ObjectId;
  level: String;
  expireAt: Date | undefined;
}

/*
  Declare fields in a created course document.
*/
export interface CourseDoc extends mongoose.Document {
  title: String;
  term: CourseTerm;
  termOffered?: String[];
  year: String;
  version?: String;
  number?: String;
  department?: String;
  tags?: String[];
  area?: String;
  credits: Number;
  wi?: Boolean;
  taken?: Boolean;
  preReq?: PreReq[];
  isPlaceholder?: Boolean;
  isTransfer?: Boolean;
  ratings?: String[];
  distribution_ids: mongoose.Schema.Types.ObjectId[];
  year_id: mongoose.Schema.Types.ObjectId;
  plan_id: mongoose.Schema.Types.ObjectId;
  user_id: mongoose.Schema.Types.ObjectId;
  level: String;
  forceSatisfied?: String;
  expireAt?: Date;
}

interface CourseModel extends mongoose.Model<CourseDoc> {
  build(attrs: CourseAttrs): CourseDoc;
}

/*  
    This model refers to specific courses that a student takes.
    Some fields are not required in order to support customized courses.
*/
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  term: {
    type: String,
    required: true,
    enum: CourseTerm,
  },
  termOffered: [{ type: String }],
  year: {
    type: String,
    required: true,
  },
  version: { type: String }, //the version of the SIS course
  number: String,
  department: String,
  tags: [{ type: String }],
  area: String,
  credits: { type: Number, required: true },
  wi: { type: Boolean, default: false },
  taken: { type: Boolean, default: false },
  preReq: { type: Array },
  isPlaceholder: { type: Boolean, default: false },
  isTransfer: { type: Boolean, default: false },
  ratings: Array,
  distribution_ids: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Distribution",
      required: true,
    },
  ],
  year_id: { type: mongoose.Schema.Types.ObjectId, ref: "Year" },
  plan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  level: { type: String, required: true },
  forceSatisfied: { type: String, required: false },
  expireAt: { type: Date, expires: 60 * 60 * 24 },
});

courseSchema.statics.build = (attrs: CourseAttrs) => {
  return new Course(attrs);
};

courseSchema.statics.findByDistributionId = function (
  d_id: mongoose.Schema.Types.ObjectId
): CourseDoc {
  return this.find({ distribution_ids: d_id });
};

courseSchema.statics.findByPlanId = function (
  plan_id: mongoose.Schema.Types.ObjectId
): CourseDoc {
  return this.find({ plan_id });
};

const Course = mongoose.model<CourseDoc, CourseModel>("Course", courseSchema);

export { Course };
