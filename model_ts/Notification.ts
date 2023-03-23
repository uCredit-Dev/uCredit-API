import mongoose from "mongoose";

export enum LinkType {
  Plan = "PLAN",
  PlanReview = "PLANREVIEW",
  User = "USER",
  Distribution = "DISTRIBUTION",
}

/*
  Fields needed to create a new Notification.
*/
export interface NotificationAttrs {
  user_id: mongoose.Schema.Types.ObjectId[];
  message: String;
  quick_link_id?: mongoose.Schema.Types.ObjectId;
  link_type?: LinkType;
  read?: Boolean;
  date?: Date;
}

/*
  Fields in a created Notification document.
*/
export interface NotificationDoc extends mongoose.Document {
  user_id: mongoose.Schema.Types.ObjectId[];
  message: String;
  quick_link_id?: mongoose.Schema.Types.ObjectId;
  link_type?: LinkType;
  read?: Boolean;
  date?: Date;
}

interface NotificationModel extends mongoose.Model<NotificationDoc> {
  build(attrs: NotificationAttrs): NotificationDoc;
}

const notificationSchema = new mongoose.Schema({
  user_id: { type: [mongoose.Schema.Types.ObjectId], ref: "User", required: true },
  message: { type: String, required: true },
  quick_link_id: { type: [mongoose.Schema.Types.ObjectId] },
  link_type: {
    type: String,
    enum: LinkType,
  },
  read: { type: Boolean, default: false },
  date: { type: Date, default: Date.now() },
});

notificationSchema.statics.build = (attrs: NotificationAttrs) => {
  return new Notification(attrs);
}

const Notification = mongoose.model<NotificationDoc, NotificationModel>(
  "Notification",
  notificationSchema
);

export { Notification };