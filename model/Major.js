const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*  
    This model refers to a student's academic major, and stores
    distribution requirements.
*/
const majorSchema = new Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  //tags()
  //wi
  //
});
