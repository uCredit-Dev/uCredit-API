const mongoose = require("mongoose");
const supertest = require("supertest");
const majors = require("../../model/Major");
const plans = require("../../model/Plan");
const fineRequirements = require("../../model/FineRequirement");
const createApp = require("../../app");
const { allMajors } = require("../../data/majors");

let planRes = {}; 

beforeEach((done) => {
  mongoose
    .connect("mongodb://localhost:27017/distributions", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
      // add all majors
      allMajors.forEach( async (major) => {
        const majorRes = await request.post("/api/majors").send(major);
      })
      const bsAMS = majors.findOne({ degree_name: "B.S. Applied Mathematics & Statistics" });
      const samplePlan = {
        name: "TEST_PLAN",
        user_id: 'TEST_USER',
        majors: [bsAMS.degree_name],
        major_ids: [bsAMS._id],
        expireAt: new Date(),
        year: "Junior",
      };
      planRes = await request.post("/api/plans").send(samplePlan);
      done();
    });
});

afterEach((done) => {
  mongoose.connection.db.collection("distributions").drop(() => {
    mongoose.connection.close(() => done());
  });
});

const request = supertest(createApp());

describe("create a plan", () => {
    it("should create a plan", async () => {
      expect(planRes).toBeTruthy(); 
      expect(plans
        .findById(planRes._id))
        .toBeTruthy(); 
    });
    it("user object should contain new plan id", async () => {
      const user = users.findById(planRes.user_id); 
      expect(user).toBeTruthy(); 
      expect(planRes.user_id).toBe(user._id);
      expect(user.plan_ids.find((id) => id === planRes._id)).toBeTruthy();
    });
    it("should be associated with a major object", async () => {
      planRes.major_id.forEach((m_id) => {
        let major = majors.findById(m_id); 
        expect(major).toBeTruthy(); 
      })
    });
    it("should create associated year objects", async () => {
      planRes.year_ids.forEach((y_id) => {
        let year = years.findById(y_id); 
        expect(year).toBeTruthy();
        expect(year.plan_id).toBe(planRes._id);
      })
    });
    it("should create associated distribution objects", async () => {
      const distObjs = distributions.find({ plan_id: planRes._id });
      expect(distObjs).toBeTruthy(); 
      expect(distObjs.length).toBe(7);
      distObjs.forEach((dist) => {
        expect(dist.plan_id).toBe(planRes._id);
        let fineReqs = fineRequirements.find({dist_id: dist._id});
        fineReqs.forEach((fine) => {
          expect(fine.distribution_id).toBe(dist._id);
          expect(fine.plan_id).toBe(planRes._id);
        })
      })
    });
  });