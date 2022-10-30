require("dotenv").config(); //search for env variables
const mongoose = require("mongoose");

//set up db connection link
const debug = process.env.DEBUG === "True";
const URI = debug ? "mongodb://db:27017/debug" : process.env.URI; 
//config connect options
const option = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

//establish connection to cloud database
async function connect() {
  await mongoose.connect(URI, option);

  //handle events emitted by the connection process
  mongoose.connection.on("error", (err) => {
    console.log(err);
  });

  mongoose.connection.on("open", () => {
    console.log("Connected to MongoDB~");
  });
}

module.exports = { connect };
