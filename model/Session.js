//passport is manageing session storage

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  createdAt: { type: Date, expires: 60 * 60 * 24 * 1000, default: Date.now() }, //60*60*24
  // sessionActivity: { type: Date, expires: "15m", default: Date.now() },
  _id: { type: String },
  hash: { type: String },
});

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
