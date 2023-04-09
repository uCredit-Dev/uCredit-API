import express from "express";
import passport from "passport";
import saml from "passport-saml";
import session from "express-session";
import bodyParser from "body-parser";
import cryptoRandomString from "crypto-random-string";
import { createToken } from "../util/token.js";
import { returnData, errorHandler, missingHandler } from "./helperMethods.js";
import Users from "../model/User.js";
import Sessions from "../model/Session.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const secret = process.env.SESSION_SECRET;
const PbK = process.env.PUBLIC_KEY;
const PvK = process.env.PRIVATE_KEY;
const DEBUG = process.env.DEBUG === "True";

const JHU_SSO_URL = "https://idp.jh.edu/idp/profile/SAML2/Redirect/SSO";
const SP_NAME = "https://ucredit-api.onrender.com";
const BASE_URL = "https://ucredit-api.onrender.com";

const displayName = "urn:oid:2.16.840.1.113730.3.1.241";
const grade = "user_field_job_title";
const email = "email";
const school = "urn:oid:1.3.6.1.4.1.5923.1.1.1.4";
const affiliation = "user_field_affiliation";
const JHEDid = "uid";

// Setup SAML strategy
const samlStrategy = new saml.Strategy(
  {
    // config options here
    entryPoint: JHU_SSO_URL,
    issuer: SP_NAME,
    callbackUrl: `${BASE_URL}/api/login/callback`,
    decryptionPvk: PvK,
    privateKey: PvK,
    // sameSite: "none",
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

if (!DEBUG) {
  router.use(
    session({
      secret: secret,
      resave: false,
      saveUninitialized: true,
      cookie: { sameSite: "none", secure: true },
    })
  );
  router.use(passport.initialize({}));
  router.use(passport.session({}));
}

// login route
router.get(
  "/api/login",
  (req, res, next) => {
    next();
  },
  passport.authenticate("samlStrategy"),
);

// callback route, redirect to frontend url
router.post(
  "/api/login/callback",
  (req, res, next) => {
    next();
  },
  passport.authenticate("samlStrategy"),
  async (req, res) => {
    // the user data is in req.user
    const id = req.user[JHEDid];
    let user = await Users.findById(id).exec();
    //if user if not in db already, create and save one
    if (user === null) {
      user = {
        _id: id,
        name: req.user[displayName],
        email: req.user[email],
        affiliation: req.user[affiliation],
        grade: req.user[grade],
        school: req.user[school],
      };
      await Users.create(user);
    } else {
      user.grade = req.user[grade];
      user.school = req.user[school];
      await user.save();
    }
    const hash = cryptoRandomString({ length: 20, type: "url-safe" });
    await Sessions
      .findByIdAndUpdate(
        id,
        { createdAt: Date.now() + 60 * 60 * 24 * 1000, hash },
        { upsert: true, new: true }
      )
      .exec();
    try {
      res.redirect(`https://ucredit.me/login/${hash}`);
    } catch (err) {
      errorHandler(res, 500, err);
    }
  }
);

//retrieve user object from db
router.get("/api/verifyLogin/:hash", async (req, res) => {
  const hash = req.params.hash;
  try {
    const user = await Sessions.findOne({ hash }).exec();
    if (!user) {
      return errorHandler(res, 401, "User not logged in.");
    }
    const retrievedUser = await Users.findById(user._id);
    const token = createToken(retrievedUser);
    returnData({ retrievedUser, token }, res);
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

router.delete("/api/verifyLogin/:hash", async (req, res) => {
  const hash = req.params.hash;
  try {
    const user = await Sessions.deleteOne({ hash }).exec();
    if (user.deletedCount != 1) {
      errorHandler(res, 404, { message: "No session found." });
    } else {
      returnData(user, res);
    }
  } catch (err) {
    errorHandler(res, 500, err);
  }
});

// route to metadata
router.get("/api/metadata", (req, res) => {
  res.type("application/xml");
  res.status(200);
  res.send(samlStrategy.generateServiceProviderMetadata(PbK, PbK));
});

export default router;
