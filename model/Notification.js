const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*  
    This model refers to a user's notification.
*/
const notificationSchema = new Schema({
  user_id: { type: String, required: true },
  message: { type: String, required: true },
  quick_link_id: { type: Schema.Types.ObjectId },
  link_type: { type: String, enum: ["PLAN", "REVIEW", "USER", "DISTRIBUTION"] },
  read: { type: Boolean, default: false },
  date: { type: Date, default: Date.now() },
});

const Notification = mongoose.model("Plan", notificationSchema);

module.exports = Notification;
