//passport is manageing session storage

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  createdAt: { type: Date, expires: 86400000000000000, default: Date.now() }, //60*60*24
  _id: { type: String },
  hash: { type: String },
});

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
