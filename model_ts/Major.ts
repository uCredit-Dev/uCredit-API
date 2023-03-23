import mongoose from "mongoose";

type FineRequirements = {
  description: String;
  required_credits: Number;
  criteria: String;
  exception?: String;
  exculsive?: Boolean;
}

type MajorDistribution = {
  name: String;
  required_credits: Number;
  min_credits_per_course: Number;
  pathing?: Boolean;
  description: String;
  criteria: String;
  user_select?: Boolean; //if true, user can put any course into this distribution
  double_count?: Boolean; //courses being classified to this distribution might also be double counted for another distribution
  exception?: String; //course that match the exception expression cannot be added toward this distirbution
  fine_requirements: FineRequirements[];
}

/*
  Fields needed to create a new Major.
*/
export interface MajorAttrs {
  degree_name: String;
  department: String;
  total_degree_credit: Number;
  wi_credit: Number;
  url?: String;
  distributions: MajorDistribution[];
}

/*
  Fields in a created Major document.
*/
export interface MajorDoc extends mongoose.Document {
  degree_name: String;
  department: String;
  total_degree_credit: Number;
  wi_credit: Number;
  url?: String;
  distributions: MajorDistribution[];
}

interface MajorModel extends mongoose.Model<MajorDoc> {
  build(attrs: MajorAttrs): MajorDoc;
}

const majorSchema = new mongoose.Schema({
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
      pathing: { type: Boolean, default: false },
      description: { type: String, required: true },
      criteria: { type: String, required: true },
      user_select: { type: Boolean, default: false }, //if true, user can put any course into this distribution
      double_count: { type: Boolean, default: false }, //courses being classified to this distribution might also be double counted for another distribution
      exception: { type: String }, //course that match the exception expression cannot be added toward this distirbution
      fine_requirements: [
        {
          description: { type: String, required: true },
          required_credits: { type: Number, required: true },
          criteria: { type: String, required: true },
          exception: { type: String },
          exclusive: { type: Boolean, default: false },
        },
      ],
    },
  ],
});

majorSchema.statics.build = (attrs: MajorAttrs) => {
  return new Major(attrs);
}

const Major = mongoose.model<MajorDoc, MajorModel>("Major", majorSchema);

export { Major };