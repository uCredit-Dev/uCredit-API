import mongoose from "mongoose";

/**
 * This model refers to a Thread -- specific courses that a student takes.
 * Some fields are not required in order to support customized courses
 */

enum Locations {
  Course = "Course",
  Semester = "Semester",
  Year = "Year",
  Plan = "Plan",
  Distribution = "Distribution"
}

/**
 * Data Transfer Object (DTO) specification for CREATING a new Thread
 */
export interface ThreadAttrs{
  plan_id: mongoose.Schema.Types.ObjectId,
  location_type: String
  location_id: String,
}

/**
 * Declare fields in a created Thread document
 */
export interface ThreadDoc extends mongoose.Document {
  plan_id: mongoose.Schema.Types.ObjectId,
  location_type: String
  location_id: String,
  resolved?: Boolean
}

/**
 * Declares a build function to enforce the use of ThreadAttrs
 * - use `Thread.build()` rather than `new Thread()`
 */
interface ThreadModel extends mongoose.Model<ThreadDoc> {
  build(attrs: ThreadAttrs): ThreadDoc;
}

const threadSchema = new mongoose.Schema ({
  plan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: true
  },
  location_type: {
    type: String,
    enum: Locations,
    required: true,
  },
  location_id: {
    type: String,
    required: true
  },
  resolved: {
    type: Boolean,
    default: false
  },
})

threadSchema.statics.build = (attrs: ThreadAttrs) => {
  return new Thread(attrs);
}

const Thread = mongoose.model<ThreadDoc, ThreadModel>("Thread", threadSchema);

export { Thread };