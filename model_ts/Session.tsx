import mongoose from "mongoose";

/**
 * This model refers to a Session
 * - Passport is managing session storage
 */

/**
 * Data Transfer Object (DTO) specification for CREATING a new Session
 */
export interface SessionAttrs{
  _id: String,
  hash: String
}

/**
 * Declare fields in a created Session document
 */
export interface SessionDoc extends mongoose.Document {
  _id: String,
  hash: String,
  createdAt: Date
}

/**
 * Declares a build function to enforce the use of SessionAttrs
 * - use `Session.build()` rather than `new Session()`
 */
interface SessionModel extends mongoose.Model<SessionDoc> {
  build(attrs: SessionAttrs): SessionDoc;
}

const sessionSchema = new mongoose.Schema ({
  _id: {
    type: String
  },
  hash: {
    type: String
  },
  createdAt: {
    type: Date,
    expires: 60 * 60 * 24 * 1000,
    default: Date.now()
  }
})

sessionSchema.statics.build = (attrs: SessionAttrs) => {
  return new Session(attrs);
}

const Session = mongoose.model<SessionDoc, SessionModel>("Session", sessionSchema);

export { Session };