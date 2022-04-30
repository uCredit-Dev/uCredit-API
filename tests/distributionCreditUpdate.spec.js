const mongoose = require("mongoose");
const distributions = require("../model/Distribution");
const { distributionCreditUpdate } = require("../routes/helperMethods");
const TEST_USER_1 = "User1";
const TEST_MAJOR_1 = "Computer Science";
const TEST_MAJOR_2 = "Math";
const TEST_YEAR_1 = "AE UG Freshman";
const TEST_USER_2 = "User2";
const TEST_YEAR_2 = "AE UG Sophomore";
const COURSE_1 = { credits: 2, taken: true };
const COURSE_2 = { credits: 1, taken: true };
const COURSE_3 = { credits: 2, taken: false };
const COURSE_4 = { credits: 1, taken: false };
const SAMPLES = [
  {
    plan_id: "61ccac7bfd08a30004b04181",
    course_id: "61ccac7bfd08a30004b04182",
    user_id: TEST_USER_1,
    year: TEST_YEAR_1,
    term: "fall",
    name: TEST_MAJOR_1,
    required: 3,
    planned: 0,
    current: 0,
    satisfied: false,
    year_id: "61ccac7bfd08a30004b04183",
  },
  {
    plan_id: "61ccac7bfd08a30004b04181",
    course_id: "61ccac7bfd08a30004b04182",
    user_id: TEST_USER_2,
    year: TEST_YEAR_2,
    term: "fall",
    name: TEST_MAJOR_2,
    required: 3,
    planned: 0,
    current: 0,
    satisfied: false,
    year_id: "61ccac7bfd08a30004b04183",
  },
];

beforeAll((done) => {
  mongoose
    .connect("mongodb://localhost:27017/helperMethods", {
      useNewUrlParser: true,
    })
    .then(async () => {
      await distributions.create(SAMPLES[0]);
      await distributions.create(SAMPLES[1]);
      done();
    });
});

afterAll((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

describe("distributionCreditUpdate should update distribution credits", () => {
  it("should update first distributions planned credits to 2 with course 1 added", async () => {
    const distributionList = await distributions.find({});
    await distributionCreditUpdate(distributionList[0], COURSE_1, true);
    expect(distributionList[0].planned).toBe(2);
  });

  it("should update first distributions current credits to 2 with course 1 added", async () => {
    const distributionList = await distributions.find({});
    expect(distributionList[0].current).toBe(2);
  });

  it("should not be satisfied since credit count is less than required", async () => {
    const distributionList = await distributions.find({});
    expect(distributionList[0].satisfied).toBe(false);
  });

  it("should update first distribution planned credits to 3 with another 1 credit course added", async () => {
    const distributionList = await distributions.find({});
    await distributionCreditUpdate(distributionList[0], COURSE_2, true);
    expect(distributionList[0].planned).toBe(3);
  });

  it("should update first distributions current credits to 3 with another 1 credit course added", async () => {
    const distributionList = await distributions.find({});
    expect(distributionList[0].current).toBe(3);
  });

  it("should be satisfied since credit count is equal to required", async () => {
    const distributionList = await distributions.find({});
    expect(distributionList[0].satisfied).toBe(true);
  });

  it("should be satisfied since credit count is more than required", async () => {
    const distributionList = await distributions.find({});
    await distributionCreditUpdate(distributionList[0], COURSE_2, true);
    expect(distributionList[0].satisfied).toBe(true);
  });

  it("should update first distributions current credits to 3 with 1 credit course subtracted", async () => {
    const distributionList = await distributions.find({});
    await distributionCreditUpdate(distributionList[0], COURSE_2, false);
    expect(distributionList[0].current).toBe(3);
  });

  it("should update first distributions planned credits to 3 with 1 credit course subtracted", async () => {
    const distributionList = await distributions.find({});
    expect(distributionList[0].planned).toBe(3);
  });

  it("should be satisfied since credit count is equal to required", async () => {
    const distributionList = await distributions.find({});
    expect(distributionList[0].satisfied).toBe(true);
  });

  it("should be not satisfied since credit count is less than required", async () => {
    const distributionList = await distributions.find({});
    await distributionCreditUpdate(distributionList[0], COURSE_1, false);
    expect(distributionList[0].satisfied).toBe(false);
  });

  it("current should not be updated for courses not taken", async () => {
    const distributionList = await distributions.find({});
    await distributionCreditUpdate(distributionList[0], COURSE_3, true);
    expect(distributionList[0].satisfied).not.toBe(distributionList[0].current);
  });

  it("should throw error for invalid distribution", async () => {
    try {
      await distributionCreditUpdate(null, COURSE_2, true);
      fail("should throw error");
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  it("should throw error for invalid course credits", async () => {
    const distributionList = await distributions.find({});
    try {
      await distributionCreditUpdate(distributionList[0], {}, true);
      fail("should throw error");
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  it("should throw error for invalid add or not", async () => {
    const distributionList = await distributions.find({});
    try {
      await distributionCreditUpdate(distributionList[0], COURSE_2, null);
      fail("should throw error");
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});
