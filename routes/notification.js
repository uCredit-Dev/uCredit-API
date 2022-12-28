import { returnData, errorHandler, forbiddenHandler } from "./helperMethods.js";
import Notifications from "../model/Notification.js";
import { auth } from "../util/token.js";
import express from "express";

const router = express.Router();

/* Get a user's notification */
router.get("/api/notifications/:user_id", auth, async (req, res) => {
  const user_id = req.params.user_id;
  if (req.user._id !== user_id) {
    return forbiddenHandler(res);
  }
  if (!user_id) {
    return errorHandler(res, 400, { message: "Must provide user_id." });
  } 
  try {
    const notifications = await Notifications.find({ user_id: { $elemMatch: { $eq: user_id } } }); 
    returnData(notifications, res); 
  } catch (err) {
    errorHandler(res, 500, err); 
  }
});

/* Create a notification */
router.post("/api/notifications", auth, async (req, res) => {
  const notification = req.body;
  // verify that notification belongs to user
  if (!notification.user_id.includes(req.user._id)) {
    return forbiddenHandler(res);
  }
  try {
    const result = await Notifications.create(notification); 
    returnData(result, res); 
  } catch (err) {
    errorHandler(res, 400, err); 
  }
});

/* Read a notification */
router.post("/api/notifications/read/:notification_id", auth, async (req, res) => {
  const notification_id = req.params.notification_id;
  const notification = await Notifications.findById(notification_id); 
  if (!notification) {
    errorHandler(res, 404, { message: "Notification not found." });
  } else if (!notification.user_id.includes(req.user._id)) {
    forbiddenHandler(res);
  } else {
    try {
      notification.read = true;
      notification.save();
      returnData(notification, res);
    } catch (err) {
      errorHandler(res, 400, err); 
    }
  }
});

/* Delete a notification */
router.delete("/api/notifications/:notification_id", auth, async (req, res) => {
  const notification_id = req.params.notification_id;
  if (!notification_id) {
    errorHandler(res, 400, { message: "Must provide notification_id." });
  }
  // check notification belongs to user
  const notif = await Notifications.findById(notification_id); 
  if (!notif.user_id.includes(req.user._id)) {
    return forbiddenHandler(res);
  }
  try {
    // delete notification
    const result = await Notifications.findByIdAndDelete(notification_id); 
    returnData(result, res);
  } catch (err) {
    errorHandler(res, 500, err); 
  }
});

export default router;
