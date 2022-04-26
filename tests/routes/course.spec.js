const mongoose = require("mongoose");
const supertest = require("supertest");
const course = require("../../model/Course");
const planDAO = require("../../model/Plan");
const createApp = require("../../app");
const planName = "testPlan";
const userName = "User1";
const years = require("../../model/Year");
const distributions = require("../../model/Distribution");
const samples = [
  {
    user_id: "csStudent",
    distribution_ids: ["6001b745e5fd0d8124251e51"],
    title: "Gateway Computing: Java",
    number: "500.112",
    term: "fall",
    credits: 3,
    year: "Junior",
  },
  {
    user_id: "csStudent",
    distribution_ids: ["6001b745e5fd0d8124251e50"],
    title: "expos",
    number: "201.220",
    term: "spring",
    wi: true,
    credits: 3,
    year: "Junior",
  },
  {
    user_id: "mathStudent",
    distribution_ids: ["6001b745e5fd0d8124251e53"],
    title: "Cryptography",
    number: "301.227",
    term: "summer",
    credits: 3,
    year: "Senior",
  },
  {
    user_id: "mathStudent",
    distribution_ids: ["6001b745e5fd0d8124251e54"],
    title: "physics",
    number: "301.280",
    term: "fall",
    credits: 4,
    year: "Senior",
  },
  {
    user_id: "bioStudent",
    distribution_ids: ["6001b745e5fd0d8124251e54"],
    title: "Linear Algebra",
    number: "501.421",
    term: "spring",
    credits: 4,
    year: "Senior",
  },
];
let addedCourses = [];

let coursesWithIds = [];

let yearArray = [];

//INCOMPLETE
beforeEach((done) => {
  mongoose
    .connect("mongodb://localhost:27017/courses", { useNewUrlParser: true })
    .then(async () => {
      const response = await request.post("/api/plans").send({
        name: planName,
        user_id: userName,
        majors: ["CS"],
        expireAt: new Date(),
        year: "Junior",
      });
      let plan1 = response.body.data;
      const sampleDistribution = await request.post("/api/distributions").send({
        plan_id: plan1._id,
        user_id: userName,
        name: "testDistribution",
        required: 1,
      });
      samples.forEach(async (sample) => {
        sample.plan_id = plan1._id;
        sample.distribution_ids = [sampleDistribution.body.data._id];
        addedCourses.push(sample);
      });
      await course.insertMany(addedCourses);
      let courses = await course.find({});
      yearArray = plan1.year_ids;
      courses.forEach(async (course) => {
        await years.findByIdAndUpdate(plan1.year_ids[3], {
          $push: { courses: course._id },
        });
        await distributions.findByIdAndUpdate(course.distribution_ids[0], {
          $push: { courses: course._id },
        });
      });
      done();
    });
});

afterEach((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

const request = supertest(createApp());

describe("Course Routes", () => {
  it("Should return course with the given _id", async () => {
    coursesWithIds = await course.find({});
    const id = coursesWithIds[0]._id;
    const name = coursesWithIds[0].name;
    await request.get(`/api/courses/${id}`).then((res) => {
      expect(res.status).toBe(200);
      const data = res.body.data;
      expect(JSON.stringify(data._id)).toBe(JSON.stringify(id));
      expect(data.name).toBe(name);
    });
  });

  it("Should return all courses with the distribution id", async () => {
    coursesWithIds = await course.find({});
    const distributionId = coursesWithIds[0].distribution_ids[0];
    const name = coursesWithIds[0].name;

    await request
      .get(`/api/coursesByDistribution/${distributionId}`)
      .then((res) => {
        expect(res.status).toBe(200);
        const data = res.body.data[0];
        expect(JSON.stringify(data.distribution_ids[0])).toBe(
          JSON.stringify(distributionId)
        );
        expect(data.name).toBe(name);
      });
  });

  it("Should return all courses associated with the plan id", async () => {
    coursesWithIds = await course.find({});
    const planId = coursesWithIds[0].plan_id;

    await request.get(`/api/coursesByPlan/${planId}`).then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(coursesWithIds.length);
      coursesWithIds.forEach((course) => {
        expect(
          res.body.data.find((course) => course._id === course._id).name
        ).toBe(course.name);
      });
    });
  });

  it("Should return all courses of a users terms for a plan", async () => {
    coursesWithIds = await course.find({});
    const planId = coursesWithIds[0].plan_id;

    await request
      .get(`/api/coursesByTerm/${planId}?year=Junior&term=fall`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThan(0);
        coursesWithIds.forEach((course) => {
          expect(
            res.body.data.find((course) => course._id === course._id).term
          ).toBe("fall");
          expect(
            res.body.data.find((course) => course._id === course._id).year
          ).toBe("Junior");
        });
      });
  });
  //NEED DISTRIBUTION IDS FOR PLAN, NOT SURE HOW TO ADD
  it("Should return created course via post request", async () => {
    coursesWithIds = await course.find({});
    const planId = coursesWithIds[0].plan_id;
    const courses = {
      user_id: "TESTUSER",
      distribution_ids: ["6001b745e5fd0d8124251e51"],
      title: "Test Course",
      term: "spring",
      credits: 4,
      year: "Junior",
      year_id: yearArray[3],
      plan_id: planId,
    };
    await planDAO.findByIdAndUpdate(planId, {
      distribution_ids: [coursesWithIds[0].distribution_ids[0]],
    });
    await request
      .post(`/api/courses/`)
      .send(courses)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe(courses.title);
        expect(res.body.data.term).toBe(courses.term);
        expect(res.body.data.number).toBe(courses.number);
      });
  });

  it("Should return course with changed status", async () => {
    coursesWithIds = await course.find({});
    const id = coursesWithIds[0]._id;
    await planDAO.findByIdAndUpdate(coursesWithIds[0].plan_id, {
      distribution_ids: [coursesWithIds[0].distribution_ids[0]],
    });

    await request
      .patch(`/api/courses/changeStatus/${id}`)
      .send({ taken: false })
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.data.taken).toBe(false);
      });
  });

  //ENDPOINT IS COMMENTED OUT
  // it("Should return course with updated distribution", async () => {
  //   coursesWithIds = await course.find({});
  //   const id = coursesWithIds[0]._id;
  //   const oldDistribution = coursesWithIds[0].distribution_ids[0];
  //   const newDistribution = "6001b745e5fd0d8124251e50";

  //   await request
  //     .patch(`/api/courses/changeDistribution/${id}`)
  //     .send({ distribution_ids: [newDistribution] })
  //     .then((res) => {
  //       console.log(res);
  //       expect(res.status).toBe(200);
  //       expect(res.body.data.distribution_ids[0]).toBe(newDistribution);
  //     });
  // });

  it("Should return deleted course", async () => {
    coursesWithIds = await course.find({});
    const id = coursesWithIds[0]._id;

    await request.delete(`/api/courses/${id}`).then((res) => {
      expect(res.status).toBe(200);
      expect(JSON.stringify(res.body.data._id)).toBe(JSON.stringify(id));
    });
  });
});
