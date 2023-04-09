import mongoose from "mongoose";

type Review = {
  s: String; // semester
  i: String; // instructor
  c: String; // comment
  w: String; // workload
  d: String; // difficulty
  l: String;
  g: String; // grading
  t: String; 
  b: String;
  o: String;
}

/* 
  Declare fields in a created evaluation document.
*/
export interface EvaluationDoc extends mongoose.Document {
  n: String;
  num: String;
  i?: String[];
  a?: String;
  w?: String;
  c?: String;
  d?: String;
  o?: String;
  e?: Number[];
  rev?: Review[];
}

const evalSchema = new mongoose.Schema({
  n: { type: String, required: true }, // course name
  num: { type: String, required: true }, // course number
  i: { type: Array }, // instructors (full name)
  a: { type: String }, // area
  w: { type: String }, // writing intensive (Y/N)
  c: { type: String }, // credits
  d: { type: String }, // departments
  o: { type: String },
  e: { type: Array }, // emotes
  rev: { type: Array }, // reviews
});

const Evaluation = mongoose.model<EvaluationDoc, mongoose.Model<EvaluationDoc>>(
  "Evaluation",
  evalSchema
);

export { Evaluation };