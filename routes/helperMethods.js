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
  res.status(status).json({
    errors: [
      {
        status: status,
        detail: err.message || err, //if err does not have a message property, just return err
      },
    ],
  });
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

module.exports = {
  returnData,
  errorHandler,
  postNotification,
};
