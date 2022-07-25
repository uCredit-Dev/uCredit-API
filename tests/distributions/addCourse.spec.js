const mongoose = require("mongoose");
const supertest = require("supertest");
const majors = require("../../model/Major");
const distributions = require("../../model/Distribution");
const plans = require("../../model/Plan");
const years = require("../../model/Year");
const courses = require("../../model/Course");
const createApp = require("../../app");
const { allMajors } = require("../../data/majors");
const fineRequirements = require("../../model/FineRequirement");

let plan = {};
let java = {};
let expos = {};

beforeAll((done) => {
  mongoose
    .connect("mongodb://localhost:27017/distributinos", {
      useNewUrlParser: true,
    })
    .then(async () => {
      const response1 = await request.post("/api/majors").send(allMajors[1]);
      bsCS = response1.body.data;
      const planBody = {
        name: "TEST_PLAN",
        user_id: "TEST_USER",
        majors: [bsCS.degree_name],
        major_ids: [bsCS._id],
        expireAt: new Date(),
        year: "Junior",
      };
      const response2 = await request.post("/api/plans").send(planBody);
      plan = response2.body.data;
      const javaBody = {
        title: "Gateway Computing: Java",
        user_id: "TEST_USER",
        term: "spring",
        credits: 3,
        year: "Junior",
        plan_id: plan._id,
        number: "EN.500.112",
      };
      const exposBody = {
        title: "Expository Writing",
        user_id: "TEST_USER",
        number: "AS.060.113",
        areas: "H",
        term: "spring",
        year: "Freshman",
        wi: true,
        plan_id: plan._id,
        credits: 3,
      };
      const response3 = await request.post("/api/courses").send(javaBody);
      const response4 = await request.post("/api/courses").send(exposBody);
      java = response3.body.data;
      expos = response4.body.data;
      done();
    });
});

afterAll((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

const request = supertest(createApp());

describe("POST /api/courses", () => {
  it("response should correspond to java", async () => {
    expect(java.title).toBe("Gateway Computing: Java");
    expect(java.user_id).toBe("TEST_USER");
    expect(java.year).toBe("Junior");
    expect(java.term).toBe("spring");
    expect(java.number).toBe("EN.500.112");
    expect(java.credits).toBe(3);
  });
  it("response should correspond to expos", async () => {
    expect(expos.title).toBe("Expository Writing");
    expect(expos.user_id).toBe("TEST_USER");
    expect(expos.year).toBe("Freshman");
    expect(expos.term).toBe("spring");
    expect(expos.number).toBe("AS.060.113");
    expect(expos.credits).toBe(3);
    expect(expos.wi).toBeTruthy();
  });
  it("course objects have correct plan_id and user_id", async () => {
    expect(java.plan_id.toString()).toBe(plan._id.toString());
    expect(java.user_id).toBe(plan.user_id);
    expect(expos.plan_id.toString()).toBe(plan._id.toString());
    expect(expos.user_id).toBe(plan.user_id);
  });
  it("course year corresponds to year objects", async () => {
    let planObj = await plans.findById(plan._id); // res does not have year_ids
    let year = await years.findById(java.year_id);
    expect(year.name).toBe(java.year);
    expect(year.plan_id.toString()).toBe(planObj._id.toString());
    expect(
      planObj.year_ids.find((id) => id.toString() === java.year_id.toString())
    ).toBeTruthy();
    expect(
      year.courses.find((c) => c.toString() === java._id.toString())
    ).toBeTruthy();
    year = await years.findById(expos.year_id);
    expect(year.name).toBe(expos.year);
    expect(year.plan_id.toString()).toBe(planObj._id.toString());
    expect(
      planObj.year_ids.find((id) => id.toString() === expos.year_id.toString())
    ).toBeTruthy();
    expect(
      year.courses.find((c) => c.toString() === expos._id.toString())
    ).toBeTruthy();
  });
  it("java fulfills the Computer Science distribution", async () => {
    expect(java.distribution_ids.length).toBe(1);
    for (let distId of java.distribution_ids) {
      const dist = await distributions.findById(distId);
      expect(dist.plan_id.toString()).toBe(java.plan_id.toString());
      expect(dist.user_id.toString()).toBe(java.user_id.toString());
      expect(dist.name).toBe("Computer Science");
      expect(dist.planned).toBe(java.credits);
      expect(dist.satisfied).toBe(false);
      expect(dist.fineReq_ids.length).toBe(5);
    }
    // should update fine requirement about core CS courses
    expect(java.fineReq_ids.length).toBe(1);
    const fine = await fineRequirements.findById(java.fineReq_ids[0]);
    expect(fine).toBeTruthy();
    expect(fine.planned).toBe(java.credits);
    expect(fine.satisfied).toBe(false);
    expect(fine.criteria.includes(java.number)).toBeTruthy();
  });
  it("expos fulfills Liberal Arts and WI distributions", async () => {
    expect(expos.distribution_ids.length).toBe(2);
    for (let distId of expos.distribution_ids) {
      const dist = await distributions.findById(distId);
      expect(dist.plan_id.toString()).toBe(expos.plan_id.toString());
      expect(dist.user_id.toString()).toBe(expos.user_id.toString());
      expect(dist.planned).toBe(expos.credits);
      expect(dist.satisfied).toBe(false);
      if (dist.required_credits === 6) {
        expect(dist.name).toBe("Writing Intensive");
      } else {
        expect(dist.name).toBe("Liberal Arts");
      }
    }
    expect(expos.fineReq_ids.length).toBe(1);
    const fine = await fineRequirements.findById(expos.fineReq_ids[0]);
    expect(fine).toBeTruthy();
    expect(fine.satisfied).toBeTruthy();
    expect(fine.planned).toBe(expos.credits);
  });
  it("should not add courses to a satisfied distribution", async () => {
    const exposBody = {
      title: "Expository Writing",
      user_id: "TEST_USER",
      number: "AS.060.113",
      areas: "H",
      term: "spring",
      year: "Freshman",
      wi: true,
      plan_id: plan._id,
      credits: 3,
    };
    let lastExpos = await request.post("/api/courses").send(exposBody); // in
    lastExpos = lastExpos.body.data;
    let extraExpos = await request.post("/api/courses").send(exposBody); // not in
    extraExpos = extraExpos.body.data;
    expect(lastExpos.distribution_ids.length).toBe(2);
    expect(extraExpos.distribution_ids.length).toBe(1);
    for (let distId of lastExpos.distribution_ids) {
      const dist = await distributions.findById(distId);
      if (dist.required_credits === 6) {
        expect(dist.name).toBe("Writing Intensive");
        expect(dist.planned).toBe(6); // should not be 9
        expect(dist.satisfied).toBeTruthy(); // should be true
        // 3rd expos class only fulfilled liberal arts
        expect(!extraExpos.distribution_ids.includes(dist._id)).toBeTruthy();
        const fine = await fineRequirements.findOne({
          distribution_id: dist._id,
        });
        expect(fine.satisfied).toBeTruthy();
        expect(fine.planned).toBe(3);
      } else {
        expect(dist.name).toBe("Liberal Arts");
        expect(
          extraExpos.distribution_ids.find(
            (expoDist) => expoDist._id.toString() === dist._id.toString()
          )
        ).toBeTruthy();
      }
    }
  });
  it("can create course with minimal information", async () => {
    const body = {
      title: "title",
      term: "fall",
      year: "Sophomore",
      credits: 1,
      plan_id: plan._id,
      user_id: "TEST_USER",
    };
    let res = await request.post("/api/courses").send(body);
    expect(res.status).toBe(200);
    const course = res.body.data;
    expect(course.distribution_ids.length).toBe(0);
  });
});

const data = { test: true };
