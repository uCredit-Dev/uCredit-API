const mongoose = require("mongoose");
const supertest = require("supertest");
const majors = require("../../model/Major");
const createApp = require("../../app");
const { allMajors } = require("../../data/majors");

let major1 = [];
let major2 = [];
let plan1 = [];
let course1 = [];
const samplePlan = {
  name: "TEST_PLAN",
  user_id: 'TEST_USER',
  majors: [allMajors[0].name],
  expireAt: new Date(),
  year: "Junior",
};

beforeEach((done) => {
  mongoose
    .connect("mongodb://localhost:27017/distributions", { useNewUrlParser: true })
    .then(async () => {
      major1 = request.post("/api/majors").send(allMajors[0]);
      major2 = request.post("/api/majors").send(allMajors[5]);
      const response2 = await request.post("/api/plans").send(samplePlan);
      plan1 = response2.body.data;
      const course = {
        title: "TEST_COURSE",
        user_id: 'TEST_USER',
        term: "spring",
        distribution_ids: [],
        credits: 4,
        year: "Junior",
        plan_id: plan1._id,
      };
      const response3 = await request.post("/api/courses").send(course);
      course1 = response3.body.data;
      const body = {
        id: plan1._id, 
        majors: [plan1.major[0].name], 
        name: plan1.name,
      };
      request.patch(`/api/plans/update/`).send(body);
      done();
    });
});

afterEach((done) => {
    mongoose.connection.db.collection("distributions").drop(() => {
      mongoose.connection.close(() => done());
    });
  });

  describe("Adding a major", () => {
    it("should create associated distribution objects with correct major_id", async () => {
      const updatedPlan = plans.findById(plan1._id);
      const distIds = updatedPlan.distribution_ids;
      expect(distIds.length > 0)
      expect(updatedPlan).toBeTruthy(); 
      for (let id of distIds) {
        let dist = distributions.findById(id); 
        expect(distributions.findById(id)).toBeTruthy(); 
        expect(dist.major_id).toBe(major1._id);
      }
    });
  });