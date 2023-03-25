import mongoose from "mongoose";

/**
 * This model refers to a User
 */

export enum Affiliation {
  STUDENT = "STUDENT",
  FACULTY = "FACULTY",
  STAFF = "STAFF"
}

/**
 * Data Transfer Object (DTO) specification for CREATING a new User
 */
export interface UserAttrs{
  _id: String, // JHED ID
  name: String,
  email: String,
  affiliation: Affiliation,
  school: String,
  grade: String, // i.e., AE UG Sophomore
  plan_ids: mongoose.Schema.Types.ObjectId[]
}

/**
 * Declare fields in a created User document
 */
export interface UserDoc extends mongoose.Document {
  _id: String, // JHED ID
  name: String,
  email: String,
  affiliation: Affiliation,
  school: String,
  grade: String,
  plan_ids: mongoose.Schema.Types.ObjectId[]
}

/**
 * Declares a build function to enforce the use of UserAttrs
 * - use `User.build()` rather than `new User()`
 */
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema ({
  _id: { type: String },
  name: { type: String },
  email: { type: String },
  affiliation: { type: Affiliation },
  school: { type: String },
  grade: { type: String }, 
  plan_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    default: []
  }],
})

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
}

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };