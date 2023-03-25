import mongoose from "mongoose";

/**
 * This model refers to a course retrieved from the SIS API 
 * The SISCourse type is deprecated and version might be converted to just SISCourse in the future.
 */

/**
 * Data Transfer Object (DTO) specification for CREATING a new SISCourse
 */
export interface SISCourseVAttrs{
  title: String,
  number: String,
  terms: String[],
  versions: [{
    areas: String,
    term: String,
    school: String,
    department: String,
    credits: Number,
    wi: Boolean,
    bio?: String,
    level?: String,
    tags?: String[],
    preReq?: String[], // TODO: what's the actual type for this?
    coReq?: String[], // TODO: what's the actual type for this?
    restrictions?: String[], // TODO: what's the actual type for this?
  }]
}

/**
 * Declare fields in a created SISCourseV document
 */
export interface SISCourseVDoc extends mongoose.Document {
  title: String,
  number: String,
  terms: String[],
  versions: [{
    areas: String,
    term: String,
    school: String,
    department: String,
    credits: Number,
    wi: Boolean,
    bio?: String,
    level?: String,
    tags?: String[],
    preReq?: String[], // TODO: what's the actual type for this?
    coReq?: String[], // TODO: what's the actual type for this?
    restrictions?: String[], // TODO: what's the actual type for this?
  }]
}

/**
 * Declares a build function to enforce the use of SISCourseVAttrs
 * - use `SISCourseV.build()` rather than `new SISCourseV()`
 */
interface SISCourseVModel extends mongoose.Model<SISCourseVDoc> {
  build(attrs: SISCourseVAttrs): SISCourseVDoc;
}

const SISCourseVSchema = new mongoose.Schema ({
  title: {
    type: String,
    required: true
  },
  number: {
    type: String,
    required: true
  },
  terms: [{
    type: String,
    required: true
  }],
  versions: [
    {
      areas: { type: String, required: true },
      term: { type: String, required: true },
      school: { type: String, required: true },
      department: { type: String, default: "Unspecified" },
      credits: { type: Number, required: true },
      wi: { type: Boolean, required: true },
      bio: { type: String },
      level: { type: String },
      tags: [{ type: String }],
      preReq: { type: Array },
      coReq: { type: Array },
      restrictions: { type: Array },
    },
  ],
})

SISCourseVSchema.statics.build = (attrs: SISCourseVAttrs) => {
  return new SISCourseV(attrs);
}

const SISCourseV = mongoose.model<SISCourseVDoc, SISCourseVModel>("_", SISCourseVSchema);

export { SISCourseV };