//some helper methods for routing
import Notifications from "../model/Notification.js";

//add data field to the response object. If data is null, return 404 error
function returnData(data, res) {
  data
    ? res.json({ data: data })
    : errorHandler(res, 404, "Resource not found");
}

//set status code of the response and send error info to the user in json
function errorHandler(res, status, err) {
  if (res.headersSent) return;
  // console.log(` >> ${err.message}`); 
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

function missingHandler(res, required) {
  if (res.headersSent) return;
  res.status(400).json({
    status: 400,
    message: "Request is missing required fields.",
    required,
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
  let notification; 
  if (quick_link_id && link_type) {
    notification = { message, user_id, quick_link_id, link_type };
  } else {
    notification = { message, user_id };
  }
  const n = await Notifications.create(notification);
  return n;
}

const REVIEW_STATUS = {
  PENDING: "PENDING", 
  UNDERREVIEW: "UNDERREVIEW", 
  APPROVED: "APPROVED", 
  REJECTED: "REJECTED"
}; 

const NOTIF_TYPE = {
  PLAN: "PLAN", 
  PLANREVIEW: "PLANREVIEW", 
  USER: "USER", 
  DISTRIBUTION: "DISTRIBUTION"
}

export {
  returnData,
  errorHandler,
  forbiddenHandler,
  missingHandler,
  distributionCreditUpdate,
  postNotification,
  REVIEW_STATUS, 
  NOTIF_TYPE
};
