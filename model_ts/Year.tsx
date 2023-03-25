import mongoose, { mongo } from "mongoose";

/**
 * This model refers to a Year
 */

/**
 * Data Transfer Object (DTO) specification for CREATING a new Year 
 */
export interface YearAttrs{
  name: String
  courses: mongoose.Schema.Types.ObjectId[],
  plan_id: mongoose.Schema.Types.ObjectId, // TODO: why is this a list in the .js version?
  user_id: String,
  year?: Number
}

/**
 * Declare fields in a created Year document
 */
export interface YearDoc extends mongoose.Document {
  name: String
  courses: mongoose.Schema.Types.ObjectId[],
  plan_id: mongoose.Schema.Types.ObjectId[],
  user_id: String,
  year?: Number
  expireAt: Date
}

/**
 * Declares a build function to enforce the use of YearAttrs
 * - use `Year.build()` rather than `new Year()`
 */
interface YearModel extends mongoose.Model<YearDoc> {
  build(attrs: YearAttrs): YearDoc;
}

const yearSchema = new mongoose.Schema ({
  name: {
    type: String,
    required: true
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  }],
  plan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: true
  },
  user_id: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: false
  },
  expireAt: {
    type: Date,
    expires: 60 * 60 * 24
  }
})

yearSchema.statics.build = (attrs: YearAttrs) => {
  return new Year(attrs);
}

const Year = mongoose.model<YearDoc, YearModel>("Year", yearSchema);

export { Year };