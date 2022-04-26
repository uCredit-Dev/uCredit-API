const mongoose = require("mongoose");
const supertest = require("supertest");
const { returnData } = require("../../routes/helperMethods");
const course = require("../../model/Course");
const createApp = require("../../app");
const { addSampleCourses } = require("../../data/courseSamples");

//INCOMPLETE
beforeEach((done) => {
  mongoose
    .connect("mongodb://localhost:27017/majors", { useNewUrlParser: true })
    .then(() => done());
});

afterEach((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

const request = supertest(createApp());

describe("Course Routes", () => {
  it("Should return course with the given _id", async () => {
    const id = "61ccf7f4723b840004850ea3";
    const name = "Introduction to Abstract Algebra";
    await request.get(`/api/courses/${id}`).then((res) => {
      res.code.should.equal(200);
      const data = res.body.data;
      data._id.should.equal(id);
      data.title.should.equal(name);
    });
  });

  it("Should return all courses with the distribution id", async () => {
    const distributionId = "61cce47ca2ec790004427212";
    const name = "Introduction to Abstract Algebra";

    await request
      .get(`/api/coursesByDistribution/${distributionId}`)
      .then((res) => {
        res.code.should.equal(200);
        const data = res.body.data;
        data._id.should.equal(distributionId);
        data.title.should.equal(name);
      });
  });

  it("Should return all courses associated with the plan id", async () => {
    const planId = "61cce47ca2ec790004427200";
    const name = "Introduction to Abstract Algebra";

    await request.get(`/api/coursesByPlan/${planId}`).then((res) => {
      res.code.should.equal(200);
      const data = res.body.data;
      data._id.should.equal(planId);
      data.title.should.equal(name);
    });
  });

  it("Should return all courses of a users terms for a plan", async () => {
    const planId = "61cce47ca2ec790004427200";
    const name = "Introduction to Abstract Algebra";

    await request.get(`/api/coursesByTerm/${planId}`).then((res) => {
      res.code.should.equal(200);
      const data = res.body.data;
      data._id.should.equal(planId);
    });
  });

  it("Should return created course via post request", async () => {
    const name = "";
    const term = "";
    const number = "";

    await request
      .post(`/api/courses/`)
      .send(course)
      .then((res) => {
        res.code.should.equal(200);
        res.body.data.title.should.equal(name);
        res.body.data.term.should.equal(term);
        res.body.data.number.should.equal(number);
      });
  });

  it("Should return course with changed status", async () => {
    const id = "61ccf7f4723b840004850ea3";
    const newStatus = "completed";

    await request
      .patch(`/api/courses/changeStatus/61ccf7f4723b840004850ea3`)
      .send(course)
      .then((res) => {
        res.code.should.equal(200);
        res.body.data.status.should.equal(newStatus);
      });
  });

  it("Should return course with updated distribution", async () => {
    const id = "61ccf7f4723b840004850ea3";
    const newDistribution = "completed";

    await request
      .patch(`/api/courses/changeDistribution/61ccf7f4723b840004850ea3`)
      .send(course)
      .then((res) => {
        res.code.should.equal(200);
        res.body.data.distributionId.should.equal(newDistribution);
      });
  });

  it("Should return deleted course", async () => {
    const id = "61ccf7f4723b840004850ea3";

    await request
      .delete(`/api/courses/61ccf7f4723b840004850ea3`)
      .then((res) => {
        res.code.should.equal(200);
        res.body.data._id.should.equal(id);
      });
  });
});
