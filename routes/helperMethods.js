//some helper methods for routing
const cjson = require("compressed-json");

//add data field to the response object. If data is null, return 404 error
function returnData(data, res) {
  data
    ? cjson.compress(res.json({ data: data }))
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

function distributionCreditUpdate(distribution, course, add) {
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
  distribution.save();
}
module.exports = { returnData, errorHandler, distributionCreditUpdate };
