import mongoose from "mongoose";
import MongooseResult from "./MongooseResult";

/*  
    This model refers to a user plan.
    A user can have multiple plans for different combination of majors.
*/

/**
 * Data Transfer Object (DTO) specification for CREATING a new Plan
 */
export interface PlanAttrs {
  name: String,
  majors: String[],
  year_ids: [mongoose.Schema.Types.ObjectId],
  distribution_ids: [mongoose.Schema.Types.ObjectId],
  user_id: String,
};

/**
 * Declare fields in a created Plan document
 */
export interface PlanDoc extends mongoose.Document, MongooseResult {
  name: String,
  majors: String[],
  year_ids: mongoose.Schema.Types.ObjectId[],
  distribution_ids: mongoose.Schema.Types.ObjectId[],
  user_id: String,
  expireAt?: Date
}

/**
 * Declares a build function to enforce the use of PlanAttrs
 * - use `Plan.build()` rather than `new Plan()`
 */
interface PlanModel extends mongoose.Model<PlanDoc> {
  build(attrs: PlanAttrs): PlanDoc;
}

const planSchema = new mongoose.Schema ({
  name: {
    type: String,
    required: true
  },
  majors: [{
    type: String,
  }],
  year_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Year",
  }],
  distribution_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Distribution",
  }],
  user_id: {
    type: String,
    required: true
  },
  expireAt: {
    type: Date,
    default: Date.now()
  }
})

planSchema.statics.build = (attrs: PlanAttrs) => {
  return new Plan(attrs);
}

const Plan = mongoose.model<PlanDoc, PlanModel>("Plan", planSchema);

export { Plan };