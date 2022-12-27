import mongoose from "mongoose";
import supertest from "supertest";
import plans from "../../model/Plan";
import createApp from "../../app";
import users from "../../model/User";
import courses from "../../model/Course";
import distributions from "../../model/Distribution";
import years from "../../model/Year";

const TEST_PLAN_NAME_1 = "testPlan1";
const TEST_USER_1 = "User1";
const TEST_MAJOR_1 = "Computer Science";
const TEST_MAJOR_2 = "Math";
const TEST_DATE = new Date(1519129864400);
const TEST_YEAR_1 = "AE UG Freshman";
const TEST_PLAN_NAME_2 = "testPlan2";
const TEST_USER_2 = "User2";
const TEST_YEAR_2 = "AE UG Sophomore";
const postBody1 = {
  name: TEST_PLAN_NAME_1,
  user_id: TEST_USER_1,
  majors: [TEST_MAJOR_1, TEST_MAJOR_2],
  expireAt: TEST_DATE,
  year: TEST_YEAR_1,
};

const postBody2 = {
  name: TEST_PLAN_NAME_2,
  user_id: TEST_USER_2,
  majors: [TEST_MAJOR_1],
  expireAt: TEST_DATE,
  year: TEST_YEAR_2,
};

beforeEach((done) => {
  mongoose
    .connect("mongodb://localhost:27017/distributions", {
      useNewUrlParser: true,
    })
    .then(async () => {
      await users.create({ _id: TEST_USER_1 });
      await users.create({ _id: TEST_USER_2 });
      const resp1 = await request.post("/api/plans").send(postBody1);
      const resp2 = await request.post("/api/plans").send(postBody2);
      for (let i = 0; i < 5; i++) {
        const plan = i < 3 ? resp1.body.data : resp2.body.data;
        const courseResp = await courses.create({
          name: `course${i}`,
          plan_id: plan._id,
          year_id: plan.year_ids[0],
          user_id: TEST_USER_1,
          year: TEST_YEAR_1,
          term: "fall",
          credits: 0,
          title: i,
        });

        await years.findByIdAndUpdate(plan.year_ids[0], {
          $push: { courses: courseResp._id },
        });
        const distributionResp = await distributions.create({
          plan_id: plan._id,
          course_id: courseResp._id,
          user_id: TEST_USER_1,
          year: TEST_YEAR_1,
          term: "fall",
          name: i,
          required: true,
          year_id: plan.year_ids[0],
        });
        await distributions.findByIdAndUpdate(distributionResp._id, {
          $push: { courses: courseResp._id },
        });
        await courses.findByIdAndUpdate(courseResp._id, {
          $push: { distribution_ids: distributionResp._id },
        });
        await plans.findByIdAndUpdate(plan._id, {
          $push: { distribution_ids: distributionResp._id },
        });
      }
      done();
    });
});

afterEach((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

const request = supertest(createApp());

describe("GET /api/distributions/:distribution_id", () => {
  it("should return a distribution by distribution id", async () => {
    const distributionList = await distributions.find({});
    const distribution = distributionList[0];
    const resp = await request.get("/api/distributions/" + distribution._id);
    expect(resp.body.data).toBeTruthy();
    expect(resp.status).toBe(200);
    expect(JSON.stringify(resp.body.data._id)).toBe(
      JSON.stringify(distribution._id)
    );
  });

  it("should throw status 400 on null id", async () => {
    const response = await request.get("/api/distributions/%00");
    expect(response.status).toBe(400);
  });
});

describe("GET /api/distributionsByPlan/:plan_id", () => {
  it("should return a distribution by plan id", async () => {
    const planList = await plans.find({});
    const plan_id = planList[0]._id;
    const distributionList = await distributions.find({});
    const distribution = distributionList[0];
    const resp = await request.get("/api/distributionsByPlan/" + plan_id);
    expect(resp.body.data).toBeTruthy();
    expect(resp.status).toBe(200);
    expect(resp.body.data.length).toBe(3);
    expect(JSON.stringify(resp.body.data[0]._id)).toBe(
      JSON.stringify(distribution._id)
    );
  });

  it("should throw status 400 on null id", async () => {
    const response = await request.get("/api/distributions/%00");
    expect(response.status).toBe(400);
  });
});

describe("POST /api/distributions", () => {
  it("should return the created distribution", async () => {
    const planList = await plans.find({});
    const plan_id = planList[0]._id;
    const newDistribution = {
      plan_id: plan_id,
      course_id: plan_id,
      user_id: TEST_USER_1,
      year: TEST_YEAR_1,
      term: "fall",
      name: "test",
      required: 0,
      year_id: planList[0].year_ids[0],
    };
    const resp = await request.post("/api/distributions").send(newDistribution);
    expect(resp.body.data).toBeTruthy();
    expect(resp.status).toBe(200);
    expect(JSON.stringify(resp.body.data.plan_id)).toBe(
      JSON.stringify(plan_id)
    );
    const updatedPlans = await plans.find({ _id: plan_id });
    expect(updatedPlans).toBeTruthy();
    expect(JSON.stringify(updatedPlans[0].distribution_ids[3])).toBe(
      JSON.stringify(resp.body.data._id)
    );
  });

  it("should throw status 400 on empty body", async () => {
    const response = await request.post("/api/distributions");
    expect(response.status).toBe(400);
  });

  it("should throw status 400 on incomplete body", async () => {
    const response = await request.post("/api/distributions").send({});
    expect(response.status).toBe(400);
  });
});

describe("PATCH /api/distributions/updateRequiredCredit", () => {
  it("should return the updated distribution", async () => {
    const planList = await plans.find({});
    const plan_id = planList[0]._id;
    const distributionID = planList[0].distribution_ids[0];
    const resp = await request.patch(
      "/api/distributions/updateRequiredCredits" +
        "?id=" +
        distributionID +
        "&required=1"
    );
    expect(resp.status).toBe(200);
    expect(JSON.stringify(resp.body.data._id)).toBe(
      JSON.stringify(distributionID)
    );
    expect(resp.body.data.required).toBe(1);
    const updatedPlans = await plans.find({ _id: plan_id });
    expect(updatedPlans).toBeTruthy();
    expect(JSON.stringify(updatedPlans[0].distribution_ids[0])).toBe(
      JSON.stringify(distributionID)
    );
    const updatedDistribution = await distributions.find({
      _id: updatedPlans[0].distribution_ids[0],
    });
    expect(updatedDistribution[0].required).toBe(1);
  });

  it("should throw status 400 on empty query", async () => {
    const response = await request.patch(
      "/api/distributions/updateRequiredCredits"
    );
    expect(response.status).toBe(400);
  });

  it("should throw status 400 on null id", async () => {
    const response = await request.patch(
      "/api/distributions/updateRequiredCredits?id=%00&required=1"
    );
    expect(response.status).toBe(400);
  });

  it("should throw status 400 on null required", async () => {
    const planList = await plans.find({});
    const distributionID = planList[0].distribution_ids[0];
    const response = await request.patch(
      "/api/distributions/updateRequiredCredits?id=" +
        distributionID +
        "&required=%00"
    );
    expect(response.status).toBe(400);
  });
});

describe("PATCH /api/distributions/updateName", () => {
  it("should return the updated distribution", async () => {
    const planList = await plans.find({});
    const plan_id = planList[0]._id;
    const distributionID = planList[0].distribution_ids[0];
    const resp = await request.patch(
      "/api/distributions/updateName" + "?id=" + distributionID + "&name=new"
    );
    expect(resp.status).toBe(200);
    expect(JSON.stringify(resp.body.data._id)).toBe(
      JSON.stringify(distributionID)
    );
    expect(resp.body.data.name).toBe("new");
    const updatedPlans = await plans.find({ _id: plan_id });
    expect(updatedPlans).toBeTruthy();
    expect(JSON.stringify(updatedPlans[0].distribution_ids[0])).toBe(
      JSON.stringify(distributionID)
    );
    const updatedDistribution = await distributions.find({
      _id: updatedPlans[0].distribution_ids[0],
    });
    expect(updatedDistribution[0].name).toBe("new");
  });

  it("should throw status 400 on empty query", async () => {
    const response = await request.patch("/api/distributions/updateName");
    expect(response.status).toBe(400);
  });

  it("should throw status 400 on null id", async () => {
    const response = await request.patch(
      "/api/distributions/updateName?id=%00&name=new"
    );
    expect(response.status).toBe(400);
  });
});

describe("DELETE /api/distributions/:d_id", () => {
  it("should return the deleted distribution", async () => {
    const planList = await plans.find({});
    const plan_id = planList[0]._id;
    const distributionID = planList[0].distribution_ids[0];
    const resp = await request.delete("/api/distributions/" + distributionID);
    expect(resp.status).toBe(200);
    expect(JSON.stringify(resp.body.data._id)).toBe(
      JSON.stringify(distributionID)
    );
    const updatedPlans = await plans.find({ _id: plan_id });
    expect(updatedPlans).toBeTruthy();
    updatedPlans[0].distribution_ids.forEach((id) => {
      expect(JSON.stringify(id)).not.toBe(JSON.stringify(distributionID));
    });
  });

  it("should throw status 400 on invalid id", async () => {
    const resp = await request.delete("/api/distributions/invalid");
    expect(resp.status).toBe(400);
  });
});

const data = { test: true };
