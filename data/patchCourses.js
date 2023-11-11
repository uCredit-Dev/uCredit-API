import { connect } from "./db.js";
import dotenv from "dotenv";
import SISCourseV from '../model/SISCourseV.js';
// import mongoose from 'mongoose';

// dotenv.config();
// mongoose.set('strictQuery', true);

async function patchCourses() {
  connect();

  const courses = await SISCourseV.find();

  console.log(courses);
}

patchCourses()