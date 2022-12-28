import { connect } from "./data/db.js";
import { createApp } from "./app.js";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const port = process.env.PORT || 4567;

//launch api
mongoose.set('strictQuery', true);
connect();
const app = createApp();
app.listen(port, () => {
  console.log(`server is listening on http://localhost:${port}`);
});
