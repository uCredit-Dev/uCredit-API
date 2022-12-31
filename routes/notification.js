import {
  returnData,
  errorHandler,
  forbiddenHandler,
  missingHandler,
} from "./helperMethods.js";
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
  try {
    const notifications = await Notifications.find({
      user_id: { $elemMatch: { $eq: user_id } },
    }).exec();
    returnData(notifications, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

/* Create a notification */
router.post("/api/notifications", auth, async (req, res) => {
  const notification = req.body;
  if (!notification) {
    return missingHandler(res, { notification });
  }
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
  try {
    const notification = await Notifications.findById(notification_id).exec();
    if (!notification) {
      return errorHandler(res, 404, { message: "Notification not found." });
    } else if (!notification.user_id.includes(req.user._id)) {
      return forbiddenHandler(res);
    } 
    notification.read = true;
    await notification.save();
    returnData(notification, res);
  } catch (err) {
    errorHandler(res, 400, err);
  }
});

/* Delete a notification */
router.delete("/api/notifications/:notification_id", auth, async (req, res) => {
  const notification_id = req.params.notification_id;
  try {
    // check notification belongs to user
    const notif = await Notifications.findById(notification_id).exec();
    if (!notif.user_id.includes(req.user._id)) {
      return forbiddenHandler(res);
    }
    // delete notification
    const result = await Notifications.findByIdAndDelete(
      notification_id
    ).exec();
    returnData(result, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

export default router;
