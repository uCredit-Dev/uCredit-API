//TODO:
//process user attribute
//contact enterpriseauth@jhmi.edu to be added to the trusted SP list
require("dotenv").config();
const express = require("express");
const passport = require("passport");
const saml = require("passport-saml");
const session = require("express-session");
const bodyParser = require("body-parser");
//const fs = require("fs");
//const path = require("path");

const router = express.Router();

const secret = process.env.SESSION_SECRET;
const PbK = process.env.PUBLIC_KEY;
const PvK = process.env.PRIVATE_KEY;

const JHU_SSO_URL = "https://idp.jh.edu/idp/profile/SAML2/Redirect/SSO";
const SP_NAME = "https://ucredit-api.herokuapp.com";
const BASE_URL = "https://ucredit-api.herokuapp.com";

// Setup SAML strategy
const samlStrategy = new saml.Strategy(
  {
    // config options here
    entryPoint: JHU_SSO_URL,
    issuer: SP_NAME,
    callbackUrl: `${BASE_URL}/api/login/callback`,
    decryptionPvk: PvK,
    privateCert: PvK,
  },
  (profile, done) => {
    return done(null, profile);
  }
);

// Tell passport to use the samlStrategy
passport.use("samlStrategy", samlStrategy);

// Serialize and deserialize user for paqssport
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

// Middleware
router.use(bodyParser.urlencoded({ extended: false }));
router.use(session({ secret: secret, resave: false, saveUninitialized: true }));
router.use(passport.initialize({}));
router.use(passport.session({}));

// login route
router.get(
  "/api/login",
  (req, res, next) => {
    next();
  },
  passport.authenticate("samlStrategy")
);

// callback route
router.post(
  "/api/login/callback",
  (req, res, next) => {
    next();
  },
  passport.authenticate("samlStrategy"),
  (req, res) => {
    // the user data is in req.user
    res.json({ data: req.user });
    /*res.send(
      `welcome ${req.user.first_name} ${req.user.last_name}, JHED id: ${req.user.id}, affiliation: ${req.user.affiliation}, job title: ${req.user.user_field_job_title}, email: ${req.user.email}`
    );
    */
  }
);

// route to metadata
router.get("/api/metadata", (req, res) => {
  res.type("application/xml");
  res.status(200);
  res.send(samlStrategy.generateServiceProviderMetadata(PbK, PbK));
});

module.exports = router;
