import {
  returnData,
  errorHandler,
  forbiddenHandler,
  missingHandler,
} from "./helperMethods";
import express, { Request, Response } from "express";
import { Notification as Notifications } from "../model_ts/Notification";
import { auth } from "../util_ts/token";

const router = express.Router();

/* Get a user's notification */
router.get("/api/notifications/:user_id", auth, async (req: any, res: Response) => {
  const user_id = req.params.user_id;
  if (!user_id) {
    return errorHandler(res, 400, { message: "Must provide user_id." });
  } else if (req.user._id !== user_id) {
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
router.post("/api/notifications", async (req: Request, res: Response) => {
  const notification = req.body;
  if (!notification || Object.keys(notification).length == 0 ||
      !notification.user_id || notification.user_id.length == 0) {
    return missingHandler(res, { notification });
  }
  try {
    const result = await Notifications.create(notification);
    returnData(result, res);
  } catch (err) {
    errorHandler(res, 400, err);
  }
});

/* Read a notification */
router.post("/api/notifications/read/:notification_id", auth, async (req: any, res: Response) => {
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
router.delete("/api/notifications/:notification_id", auth, async (req: any, res: Response) => {
  const notification_id = req.params.notification_id;
  try {
    // check notification belongs to user
    const notif = await Notifications.findById(notification_id).exec();
    if (!notif) {
      return errorHandler(res, 404, { message: "Notification not found." }); 
    } else if (!notif.user_id.includes(req.user._id)) {
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