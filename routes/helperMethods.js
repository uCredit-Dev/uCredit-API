//some helper methods for routing
const Notifications = require("../model/Notification.js");

//add data field to the response object. If data is null, return 404 error
function returnData(data, res) {
  data
    ? res.json({ data: data })
    : errorHandler(res, 404, "Resource not found");
}

//set status code of the response and send error info to the user in json
function errorHandler(res, status, err) {
  if (res.headersSent) return; 
  res.status(status).json({
    errors: [
      {
        status: status,
        detail: err.message || err, //if err does not have a message property, just return err
      },
    ],
  });
}

function forbiddenHandler(res) {
  if (res.headersSent) return; 
  res.status(403).json({
    status: 403,
    message: "You are not authorized to access this resource.",
  });
}

async function distributionCreditUpdate(distribution, course, add) {
  if (!distribution) return; 
  if (add) {
    distribution.planned += course.credits;
    if (course.taken) {
      distribution.current += course.credits;
    }
  } else {
    distribution.planned -= course.credits;
    if (course.taken) {
      distribution.current -= course.credits;
    }
  }
  distribution.satisfied =
    distribution.planned >= distribution.required ? true : false;
  await distribution.save();
}

async function postNotification(message, user_id, quick_link_id, link_type) {
  if (!message || !user_id) {
    return 400;
  }
  let notification = { message, user_id };
  if (quick_link_id && link_type) {
    notification.quick_link_id = quick_link_id;
    notification.link_type = link_type;
  }
  const n = await Notifications.create(notification);
  return n;
}
module.exports = {
  returnData,
  errorHandler,
  forbiddenHandler,
  distributionCreditUpdate,
  postNotification,
};
