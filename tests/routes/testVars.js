import { createToken } from "../../util/token";

const TEST_PLAN_NAME_1 = "testPlan1";
const TEST_PLAN_NAME_2 = "testPlan2";
const TEST_USER_1 = {
  _id: "User1",
  name: "User One",
  affiliation: "STUDENT",
}
const TEST_USER_2 = {
  _id: "User2",
  name: "User Two",
  affiliation: "STUDENT",
}
const TEST_TOKEN_1 = createToken(TEST_USER_1);
const TEST_TOKEN_2 = createToken(TEST_USER_2);
const TEST_CS = "B.S. Computer Science (NEW - 2021 & after)";
const TEST_AMS = "B.S. Applied Mathematics & Statistics";
const TEST_DATE = new Date(1519129864400);
const TEST_YEAR_1 = "AE UG Freshman";
const TEST_YEAR_2 = "AE UG Sophomore";

/* lacks plan_id and distribution_ids */ 
const sampleCourses = [
  {
    user_id: TEST_USER_1._id,
    title: "Gateway Computing: Java",
    number: "EN.500.112",
    term: "fall",
    credits: 3,
    year: "Junior",
    level: "Lower Level Undergraduate"
  },
  {
    user_id: TEST_USER_1._id,
    title: "expos",
    number: "201.220",
    term: "fall",
    wi: true,
    credits: 3,
    year: "Junior",
    level: "Lower Level Undergraduate"
  },
  {
    user_id: TEST_USER_2._id,
    title: "Cryptography",
    number: "301.227",
    term: "summer",
    credits: 3,
    year: "Junior",
    level: "Lower Level Undergraduate"
  },
  {
    user_id: TEST_USER_2._id,
    title: "physics",
    number: "301.280",
    term: "fall",
    credits: 4,
    year: "Junior",
    level: "Lower Level Undergraduate"
  },
  {
    user_id: TEST_USER_1._id,
    title: "Linear Algebra",
    number: "501.421",
    term: "spring",
    credits: 4,
    year: "Junior",
    level: "Upper Level Undergraduate"
  },
];

export {
  sampleCourses,
  TEST_PLAN_NAME_1, 
  TEST_PLAN_NAME_2, 
  TEST_USER_1, 
  TEST_USER_2, 
  TEST_AMS,
  TEST_CS, 
  TEST_DATE, 
  TEST_TOKEN_1, 
  TEST_TOKEN_2, 
}