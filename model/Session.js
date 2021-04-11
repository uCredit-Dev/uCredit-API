const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  createdAt: { type: Date, expires: 60, default: Date.now },
  _id: { type: String },
  hash: { type: String },
});

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
