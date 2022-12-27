import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

//set up db connection link
//if debug, connect to local docker container
//else, connect to dev or prod db URI in .env file
const debug = process.env.DEBUG === "True";
const URI = debug ? "mongodb://db:27017/debug" : process.env.URI;

//config connect options

//establish connection to cloud database
export async function connect() {
  console.log(URI);
  mongoose.connect(URI);

  //handle events emitted by the connection process
  mongoose.connection.on("error", (err) => {
    console.log(err);
  });

  mongoose.connection.on("open", () => {
    console.log("Connected to MongoDB~");
  });
}
