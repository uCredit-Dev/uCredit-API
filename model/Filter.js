const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FilterSchema = new Schema({
  area: { type: RegExp, required: false },
  tags: { type: Array, required: false },
  department: { type: RegExp, required: false },
  title: { type: RegExp, required: false },
  number: { type: RegExp, required: false },
  wi: { type: Boolean, required: false },
  exception: { type: Object, required: false },
});

const Filter = mongoose.model("Filter", FilterSchema);

module.exports = Filter;
