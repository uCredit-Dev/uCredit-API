import { createToken } from "../../util/token";
import mongoose from "mongoose";

const INVALID_ID = "%00";
const VALID_ID = new mongoose.Types.ObjectId();
const TEST_PLAN_NAME_1 = "testPlan1";
const TEST_PLAN_NAME_2 = "testPlan2";
const TEST_USER_1 = {
  _id: "user1",
  name: "User One",
  affiliation: "STUDENT",
  email: "user1@email.com",
};
const TEST_USER_2 = {
  _id: "user2",
  name: "User Two",
  affiliation: "STUDENT",
  email: "user2@email.com",
};
const TEST_TOKEN_1 = createToken(TEST_USER_1);
const TEST_TOKEN_2 = createToken(TEST_USER_2);
const TEST_CS = "B.S. Computer Science (NEW - 2021 & after)";
const TEST_AMS = "B.S. Applied Mathematics & Statistics";
const TEST_COG = "B.A. Cognitive Science";
const TEST_DATE = new Date(1519129864400);
const SOPHOMORE = "AE UG SOPHOMORE";
const FRESHMAN = "AE UG FRESHMAN";
const JUNIOR = "AE UG JUNIOR";
const SENIOR = "AE UG SENIOR";
const TEST_PLAN_1 = {
  name: TEST_PLAN_NAME_1,
  user_id: TEST_USER_1._id,
  major_ids: [TEST_CS, TEST_AMS],
  expireAt: TEST_DATE,
  year: "Junior",
};
const TEST_PLAN_2 = {
  name: TEST_PLAN_NAME_2,
  user_id: TEST_USER_2._id,
  major_ids: [TEST_AMS],
  expireAt: TEST_DATE,
  year: "Freshman",
};

/* lacks plan_id and distribution_ids */
const SAMEPLE_COURSES = [
  {
    user_id: TEST_USER_1._id,
    title: "Gateway Computing: Java",
    number: "EN.500.112",
    term: "fall",
    credits: 3,
    year: "Junior",
    level: "Lower Level Undergraduate",
  },
  {
    user_id: TEST_USER_1._id,
    title: "expos",
    number: "201.220",
    term: "fall",
    wi: true,
    credits: 3,
    year: "Junior",
    level: "Lower Level Undergraduate",
  },
  {
    user_id: TEST_USER_1._id,
    title: "Cryptography",
    number: "301.227",
    term: "summer",
    credits: 3,
    year: "Junior",
    level: "Lower Level Undergraduate",
  },
  {
    user_id: TEST_USER_1._id,
    title: "physics",
    number: "301.280",
    term: "fall",
    credits: 4,
    year: "Junior",
    level: "Lower Level Undergraduate",
  },
  {
    user_id: TEST_USER_1._id,
    title: "Linear Algebra",
    number: "501.421",
    term: "spring",
    credits: 4,
    year: "Junior",
    level: "Upper Level Undergraduate",
  },
];

const SAMEPLE_SIS_COURSES = [
  {
    title: "Title1",
    number: "Number1",
    terms: ["fall", "spring"],
    versions: [
      {
        areas: "HS",
        term: "fall",
        school: "EN",
        credits: 3,
        wi: false,
      },
      {
        areas: "HS",
        term: "spring",
        school: "EN",
        credits: 3,
        wi: false,
      },
    ],
  },
  {
    title: "Title2",
    number: "Number2",
    terms: ["fall"],
    versions: [
      {
        areas: "Q",
        term: "fall",
        school: "AS",
        credits: 4,
        wi: false,
      },
    ],
  },
  {
    title: "Title3",
    number: "Number3",
    terms: ["spring"],
    versions: [
      {
        areas: "NS",
        term: "spring",
        school: "AS",
        credits: 1,
        wi: true,
      },
    ],
  },
];

export {
  TEST_PLAN_NAME_1,
  TEST_PLAN_NAME_2,
  TEST_USER_1,
  TEST_USER_2,
  TEST_AMS,
  TEST_CS,
  TEST_COG,
  TEST_DATE,
  TEST_TOKEN_1,
  TEST_TOKEN_2,
  TEST_PLAN_1,
  TEST_PLAN_2,
  FRESHMAN,
  SOPHOMORE,
  JUNIOR,
  SENIOR,
  INVALID_ID,
  VALID_ID,
  SAMEPLE_COURSES,
  SAMEPLE_SIS_COURSES,
};
