const { returnData, errorHandler } = require("./helperMethods.js");
const Notifications = require("../model/Notification.js");
const { auth } = require("../util/token");

const express = require("express");
const router = express.Router();

/* Get a user's notification */
router.get("/api/notifications/:user_id", auth, (req, res) => {
  const user_id = req.params.user_id;
  if (!user_id) {
    errorHandler(res, 400, { message: "Must provide user_id." });
  }
  Notifications.find({ user_id: { $elemMatch: user_id } })
    .then((notifications) => {
      returnData(notifications, res);
    })
    .catch((err) => errorHandler(res, 500, err));
});

/* Create a notification */
router.post("/api/notifications", auth, (req, res) => {
  const notification = req.body;
  Notifications.create(notification)
    .then((result) => {
      returnData(result, res);
    })
    .catch((err) => errorHandler(res, 400, err));
});

/* Read a notification */
router.post("/api/notifications/read/:notification_id", auth, (req, res) => {
  const notification_id = req.params.notification_id;
  Notifications.findById(notification_id)
    .then((notification) => {
      if (!notification) {
        errorHandler(res, 404, { message: "Notification not found." });
      } else {
        notification.read = true;
        notification.save();
        returnData(notification, res);
      }
    })
    .catch((err) => errorHandler(res, 400, err));
});

/* Delete a notification */
router.delete("/api/notifications/:notification_id", auth, (req, res) => {
  const notification_id = req.params.notification_id;
  if (!notification_id) {
    errorHandler(res, 400, { message: "Must provide notification_id." });
  }
  Notifications.findByIdAndDelete(notification_id)
    .then((result) => {
      returnData(result, res);
    })
    .catch((err) => errorHandler(res, 500, err));
});
module.exports = router;
