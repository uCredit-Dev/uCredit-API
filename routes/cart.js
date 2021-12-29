const carts = require("../model/Cart.js");
const plans = require("../model/Plan.js");
const majors = require("../model/Major.js");
const { returnData, errorHandler } = require("./helperMethods.js");

const express = require("express");
const router = express.Router();

// GET a cart by cart id
router.get("/api/carts/:cart_id", (req, res) => {
  const cart_id = req.params.cart_id;
  carts
    .findById(cart_id)
    .then((carts) => returnData(carts, res))
    .catch((err) => errorHandler(res, 400, err));
});

// GET all the carts in an id
router.get("/api/cartsByPlan/:plan_id", (req, res) => {
  const plan_id = req.params.plan_id;
  carts
    .findById(plan_id)
    .populate({ path: "carts" })
    .then((plan) => returnData(plan.carts, res))
    .catch((err) => errorHandler(res, 400, err));
});

// POST a new cart
router.post("/api/carts", async (req, res) => {
  const cart = {
    user_id: req.body.user_id,
    plan_id: req.body.plan_id,
    major_id: req.body.major_id,
    classes: [],
  };

  // get distribution from the major field
  await majors
    .findById(major_id)
    .then((major) => {
      major.distributions.forEach((dist) => {
        const dist_name = dist.name;
        dist.fine_requirements.forEach((fine_req) => {
          const distribution = {
            name: dist_name, // NEED TO OVERHAUL MAJOR STORAGE TO MAKE THIS UNIQUE
            description: fine_req.description,
            required: fine_req.required_credits,
            //planned: ,
            criteria: fine_req.criteria,
            courses: [],
          };
          // Add this distribution to cart
          cart.classes.push(distribution);
        });
      });
    })
    .catch((err) => errorHandler(res, 500, err));

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

// PATCH add a course to a class array

/*
router.patch("/api/distributions/addCourse/:cart_id", (req, res) => {
  const cart_id = req.params.cart_id;
  const course = req.body.course_id;
  //const distribution = req.body.dist_id;
});
*/

// PATCH delete a course from a class array

module.exports = router;
