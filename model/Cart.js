const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  user_id: { type: String, required: true },
  plan_id: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
  major_id: { type: Schema.Types.ObjectId, ref: "Major", required: true },
  classes: [
    {
      /*
        Distribution here differs from the existing Distribution model.
        Rather, it is here to denote what distribution requirement this collection of courses fulfills
        */
      distribution: {
        name: { type: String, required: true }, // Name of the distribution (e.g. "Upper Level General" or "Gateway"
        description: { type: String, required: true }, // NEW
        required: { type: Number, required: true }, // Required number of credits
        planned: { type: Number, required: true }, // Number of credits from course array
        criteria: { type: String, required: true }, // What courses fulfill this requirement
      },
      courses: [{ type: Schema.Types.ObjectId, ref: "Course" }], // courses used to fulfill
    },
  ],
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
