import { connect } from "./data/db.js";
import { createApp } from "./app.js";
import dotenv from "dotenv";

dotenv.config();
const port = process.env.PORT || 4567;

//launch api
connect();
const app = createApp();
app.listen(port, () => {
  console.log(`server is listening on http://localhost:${port}`);
});
