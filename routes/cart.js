const carts = require("../model/Cart.js");
const plans = require("../model/Plan.js");
const { returnData, errorHandler } = require("./helperMethods.js");

const express = require("express");
const router = express.Router();

router.get("/api/carts/:cart_id", (req, res) => {
  const cart_id = req.params.cart_id;
  carts
    .findById(cart_id)
    .then((carts) => returnData(carts, res))
    .catch((err) => errorHandler(res, 400, err));
});

router.get("/api/cartsByPlan/:plan_id", (req, res) => {
  const plan_id = req.params.plan_id;
  carts
    .findById(plan_id)
    .populate({ path: "carts" })
    .then((plan) => returnData(plan.carts, res))
    .catch((err) => errorHandler(res, 400, err));
});

router.post("/api/carts", async (req, res) => {
  const cart = {
    user_id: req.body.user_id,
    plan_id: req.body.plan_id,
    major: req.body.major,
    classes: [],
  };

  // get distribution from the major field
  // loop through each object in distributions
  // pull each of the fine requirements objects into classes

  carts
    .create(cart)
    .then((cart) => {
      plans
        .findByIdAndUpdate(
          //update plan
          cart.plan_id,
          { $push: { carts: cart._id } },
          { new: true, runValidators: true }
        )
        .exec();
      returnData(cart, res);
    })
    .catch((err) => errorHandler(res, 400, err));
});

router.delete("/api/carts/:cart_id", (req, res) => {
  const cart_id = req.params.cart_id;
  carts
    .findByIdAndDelete(cart_id)
    .then((cart) => {
      plans
        .findByIdAndUpdate(
          // delete cart from the plan that holds it
          cart._id,
          { $pull: { carts: cart._id } },
          { new: true, runValidators: true }
        )
        .exec();
      returnData(cart, res);
    })
    .catch((err) => errorHandler(res, 400, err));
});

module.exports = router;

// PATCH add a course to a class array
router.patch("/api/distributions/addCourse/:cart_id", (req, res) => {
  const cart_id = req.params.cart_id;
  const course = req.body.course_id;
  //const distribution = req.body.dist_id;
});

// PATCH delete a course from a class array
