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

beforeEach((done) => {
  mongoose
    .connect("mongodb://localhost:27017/distributinos", { useNewUrlParser: true })
    .then(async () => {
      const response1 = await request.post("/api/majors").send(allMajors[3]); // cogsci 
      let cogsci = response1.body.data;
      const planBody = {
        name: "TEST_PLAN",
        user_id: 'TEST_USER',
        majors: [cogsci.degree_name],
        major_ids: [cogsci._id],
        expireAt: new Date(),
        year: "Junior",
      };
      const response2 = await request.post("/api/plans").send(planBody);
      plan = response2.body.data;
      done();
    });
});

afterAll((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

const request = supertest(createApp());

describe("POST /api/courses: EXCLUSLIVE", () => {
  it("Course with two tags: One, Two with 4 fineReqs", async () => {
    const twoTagsBody = {
      title: "TWO_TAGS",
      user_id: 'TEST_USER',
      tags: ['COGS-COGPSY', 'COGS-LING'], // One Course from each Focal Area, Two Focal Areas
      term: "spring",
      credits: 3,
      year: "Junior",
      plan_id: plan._id,
      number: "adsf"
    };
    const response = await request.post("/api/courses").send(twoTagsBody);
    const course = response.body.data; 
    let distNames = []; 
    let fineNames = []; 
    for (let d_id of course.distribution_ids) {
      let distribution = await distributions.findById(d_id); 
      distNames.push(distribution.name);
    }
    for (let f_id of course.fineReq_ids) {
      let fine = await fineRequirements.findById(f_id); 
      fineNames.push(fine.description);
    }
    expect(course.distribution_ids.length).toBe(2);
    expect(distNames).toContain("One Course from each Focal Area");
    expect(distNames).toContain("Two Focal Areas");
    // expect(fineNames.length).toBe(4);
    expect(fineNames).toContain("<b>Cognitive Psychology/Cognitive Neuropsychology</b>");
    expect(fineNames).toContain('<b>Linguistics</b>');
    expect(fineNames).toContain("<b>Cognitive Psychology/Cognitive Neuropsychology</b> " + 
      "<br />At least 2 courses must be at the 300 level or above.");
    expect(fineNames).toContain('<b>Linguistics</b> <br />' +
      'At least 2 courses must be at the 300 level or above.',);
  });
  it("Course with wi=true and areas='N': N/E/Q and WI", async () => {
    const wiNBody = {
      title: "WI_N",
      user_id: "TEST_USER",
      number: "sdfa",
      areas: "N", // N
      term: "fall",
      year: "Freshman",
      wi: true, // Writing Intensive
      plan_id: plan._id,
      credits: 3,
    };
    const response = await request.post("/api/courses").send(wiNBody);
    const course = response.body.data; 
    let names = []; 
    for (let d_id of course.distribution_ids) {
      let distribution = await distributions.findById(d_id); 
      names.push(distribution.name);
    }
    expect(course.distribution_ids.length).toBe(2);
    expect(names).toContain('Other (N/E/Q) Distribution');
    expect(names).toContain('Writing Intensive');
  });
  it("Course with areas='HNS': H", async () => {
    const HNSBody = {
      title: "H_N_S",
      user_id: "TEST_USER",
      number: "afdk",
      areas: "HNS", // Humanities (H) Distribution
      term: "spring",
      year: "Freshman",
      plan_id: plan._id,
      credits: 3,
    };
    const response = await request.post("/api/courses").send(HNSBody);
    const course = response.body.data; 
    let names = []; 
    for (let d_id of course.distribution_ids) {
      let distribution = await distributions.findById(d_id); 
      names.push(distribution.name);
    }
    expect(course.distribution_ids.length).toBe(1); 
    expect(names).toContain("Humanities (H) Distribution")
  });
  it("Course with wi=true and areas='HNS': H and WI", async () => {
    const HNSWiBody = {
      title: "HNS_Wi",
      user_id: "TEST_USER",
      number: "afdsf",
      areas: "NSH", // Humanities (H) Distribution
      wi: true, // Writing Intensive
      term: "fall",
      year: "Senior",
      plan_id: plan._id,
      credits: 3,
    };
    const response = await request.post("/api/courses").send(HNSWiBody);
    const course = response.body.data; 
    let names = []; 
    for (let d_id of course.distribution_ids) {
      let distribution = await distributions.findById(d_id); 
      names.push(distribution.name);
    }
    expect(course.distribution_ids.length).toBe(2); // double_count works 
    expect(names).toContain('Humanities (H) Distribution');
    expect(names).toContain('Writing Intensive');
  });
  it("Course with 400-level cogsci tag: One, Two", async () => {
    const upperCogBody = {
      title: "UPPER_COG",
      user_id: "TEST_USER",
      number: "AS.080.400", // NOT upper elective due to double_count 
      tags: ["COGS-NEURO"], // One Course from each Focal Area, Two Focal Areas
      term: "fall",
      year: "Senior",
      plan_id: plan._id,
      credits: 3,
    };
    const response = await request.post("/api/courses").send(upperCogBody);
    const course = response.body.data; 
    let names = []; 
    for (let d_id of course.distribution_ids) {
      let distribution = await distributions.findById(d_id); 
      names.push(distribution.name);
    }
    expect(course.distribution_ids.length).toBe(2); // double_count works 
    expect(names).toContain("One Course from each Focal Area");
    expect(names).toContain("Two Focal Areas");
  }); 
  it("Course with 400-level cogsci tag and wi and N: One, Two, H, Wi", async () => {
    const upperNWiCogBody = {
      title: "UPPER_N_WI_Cog",
      user_id: "TEST_USER",
      number: "AS.080.400", // NOT upper elective due to double_count 
      tags: ["COGS-NEURO"], // One Course from each Focal Area, Two Focal Areas
      areas: "SNH", // Humanities (H) Distribution
      wi: true, // Writing Intensive 
      term: "fall",
      year: "Senior",
      plan_id: plan._id,
      credits: 3,
    };
    const response = await request.post("/api/courses").send(upperNWiCogBody);
    const course = response.body.data; 
    let names = []; 
    for (let d_id of course.distribution_ids) {
      let distribution = await distributions.findById(d_id); 
      names.push(distribution.name);
    }
    expect(course.distribution_ids.length).toBe(4); // double_count works 
    expect(names).toContain("One Course from each Focal Area");
    expect(names).toContain("Two Focal Areas");
    expect(names).toContain("Humanities (H) Distribution");
    expect(names).toContain("Writing Intensive");
  }); 
  it("Course with 400-level cogsci tag and wi and N: sanity check (reproducibility)", async () => {
    const upperNWiCogBody = {
      title: "UPPER_N_WI_Cog",
      user_id: "TEST_USER",
      number: "AS.080.400", // NOT upper elective due to double_count 
      tags: ["COGS-NEURO"], // One Course from each Focal Area, Two Focal Areas
      areas: "SNH", // Humanities (H) Distribution
      wi: true, // Writing Intensive 
      term: "fall",
      year: "Senior",
      plan_id: plan._id,
      credits: 3,
    };
    const response = await request.post("/api/courses").send(upperNWiCogBody);
    const course = response.body.data; 
    let names = []; 
    for (let d_id of course.distribution_ids) {
      let distribution = await distributions.findById(d_id); 
      names.push(distribution.name);
    }
    expect(course.distribution_ids.length).toBe(4); // double_count works 
    expect(names).toContain("One Course from each Focal Area");
    expect(names).toContain("Two Focal Areas");
    expect(names).toContain("Humanities (H) Distribution");
    expect(names).toContain("Writing Intensive");
  }); 
});

describe("POST /api/courses: PATHING", () => {
  it("Fulfilling two paths satisfies distribution", async () => {
    const cogsNeuroBody = {
      title: "COGS-NEURO",
      user_id: "TEST_USER",
      number: "adsf", // NOT upper elective due to double_count 
      tags: ["COGS-NEURO"], // One Course from each Focal Area, Two Focal Areas
      term: "fall",
      year: "Senior",
      plan_id: plan._id,
      credits: 3,
    };
    const cogsCompcgBody = {
      title: "COGS-COMPCG",
      user_id: "TEST_USER",
      number: "afds", // NOT upper elective due to double_count 
      tags: ["COGS-COMPCG"], // One Course from each Focal Area, Two Focal Areas
      term: "fall",
      year: "Senior",
      plan_id: plan._id,
      credits: 3,
    };
    await request.post("/api/courses").send(cogsNeuroBody);
    await request.post("/api/courses").send(cogsNeuroBody);
    await request.post("/api/courses").send(cogsNeuroBody);
    await request.post("/api/courses").send(cogsNeuroBody);
    await request.post("/api/courses").send(cogsCompcgBody);
    await request.post("/api/courses").send(cogsCompcgBody);
    await request.post("/api/courses").send(cogsCompcgBody);
    let course = await request.post("/api/courses").send(cogsCompcgBody);
    course = course.body.data; 
    expect(course.distribution_ids.length).toBeTruthy;
    let found = false; 
    for (let d_id of course.distribution_ids) {
      await distributions
        .findById(d_id)
        .then(async (dist) => {
          if (dist.name === "Two Focal Areas") {
            found = true; 
            expect(dist.planned).toBe(12); // 24 but overflow 
            expect(dist.satisfied).toBeTruthy();
            await fineRequirements
              .find({plan_id: plan._id, distribution_id: dist._id})
              .then((fineObjs) => {
                let names = [];
                for (let fine of fineObjs) {
                  if (fine.satisfied) {
                    names.push(fine.criteria);
                  }
                }
                expect(names.length).toBe(2);
                expect(names).toContain("COGS-NEURO[T]");
                expect(names).toContain("COGS-COMPCG[T]");
              })
          }
        })
    }
    expect(found).toBeTruthy();
  }); 
  it("Can fulfill two paths by double pathing", async () => {
    const body = {
      title: "TWO_TAGS",
      user_id: 'TEST_USER',
      tags: ['COGS-COGPSY', 'COGS-NEURO'], // One Course from each Focal Area, Two Focal Areas
      term: "spring",
      credits: 3,
      year: "Junior",
      plan_id: plan._id,
      number: "adsf"
    };
    let course = await request.post("/api/courses").send(body);
    await request.post("/api/courses").send(body);
    await request.post("/api/courses").send(body);
    await request.post("/api/courses").send(body);
    course = course.body.data; 
    expect(course.distribution_ids.length).toBeTruthy;
    let found = false; 
    for (let d_id of course.distribution_ids) {
      await distributions
        .findById(d_id)
        .then(async (dist) => {
          if (dist.name === "Two Focal Areas") {
            found = true; 
            expect(dist.planned).toBe(12); // overflow
            expect(dist.satisfied).toBeTruthy();
            await fineRequirements
              .find({plan_id: plan._id, distribution_id: dist._id})
              .then((fineObjs) => {
                let names = [];
                for (let fine of fineObjs) {
                  if (fine.satisfied) {
                    names.push(fine.criteria);
                  }
                }
                expect(names.length).toBe(2);
                expect(names).toContain("COGS-NEURO[T]");
                expect(names).toContain("COGS-COGPSY[T]");
              })
          }
        });
    }
    expect(found).toBeTruthy();
  }); 
  it("Fulfilling one path does NOT satify distribution", async () => {
    const cogsNeuroBody = {
      title: "COGS-NEURO",
      user_id: "TEST_USER",
      number: "adsf", // NOT upper elective due to double_count 
      tags: ["COGS-NEURO"], // One Course from each Focal Area, Two Focal Areas
      term: "fall",
      year: "Senior",
      plan_id: plan._id,
      credits: 3,
    };
    await request.post("/api/courses").send(cogsNeuroBody);
    await request.post("/api/courses").send(cogsNeuroBody);
    await request.post("/api/courses").send(cogsNeuroBody);
    let course = await request.post("/api/courses").send(cogsNeuroBody);
    course = course.body.data; 
    expect(course.distribution_ids.length).toBeTruthy;
    let found = false; 
    for (let d_id of course.distribution_ids) {
      await distributions
        .findById(d_id)
        .then(async (dist) => {
          if (dist.name === "Two Focal Areas") {
            found = true; 
            expect(dist.planned).toBe(12);
            expect(dist.satisfied).toBeFalsy();
          }
          await fineRequirements
            .find({plan_id: plan._id, distribution_id: dist._id})
            .then((fineObjs) => {
              let names = [];
              for (let fine of fineObjs) {
                if (fine.satisfied) {
                  names.push(fine.criteria);
                }
              }
              expect(names.length).toBe(1);
              expect(names).toContain("COGS-NEURO[T]");
            })
        })
    }
    expect(found).toBeTruthy();
  }); 
  it("Cannot satisfy more paths than specified by pathing (2)", async () => {
    const focus = {
      title: "COGS-NEURO",
      user_id: "TEST_USER",
      number: "adsf", 
      tags: ["COGS-NEURO", "COGS-COMPCG"], 
      term: "fall",
      year: "Senior",
      plan_id: plan._id,
      credits: 3,
    };
    const elective = { // also upper 
      title: "COGS-NEURO",
      user_id: "TEST_USER",
      number: "AS.080.400", 
      tags: ["COGS-LING"], 
      term: "fall",
      year: "Senior",
      plan_id: plan._id,
      credits: 3,
    };
    await request.post("/api/courses").send(focus);
    await request.post("/api/courses").send(focus);
    await request.post("/api/courses").send(focus);
    let courseTwo = await request.post("/api/courses").send(focus); // satisfied 
    courseTwo = courseTwo.body.data; 
    await request.post("/api/courses").send(elective);
    await request.post("/api/courses").send(elective);
    await request.post("/api/courses").send(elective);
    let courseElective = await request.post("/api/courses").send(elective); 
    courseElective = courseElective.body.data; 
    expect(courseTwo.distribution_ids.length).toBeTruthy;
    let found = false; 
    for (let d_id of courseTwo.distribution_ids) {
      await distributions
        .findById(d_id)
        .then(async (dist) => {
          if (dist.name === "Two Focal Areas") {
            found = true; 
            expect(dist.planned).toBe(12);
            expect(dist.satisfied).toBeTruthy();
          }
          await fineRequirements
            .find({plan_id: plan._id, distribution_id: dist._id})
            .then((fineObjs) => {
              let names = [];
              for (let fine of fineObjs) {
                if (fine.satisfied) {
                  names.push(fine.criteria);
                }
              }
              console.log(names);
              expect(names.length).toBe(2);
              expect(names).toContain("COGS-NEURO[T]");
              expect(names).toContain("COGS-COGPSY[T]");
            })
        })
    }
    expect(found).toBeTruthy();
    expect(courseElective.distribution_ids.length).toBeTruthy;
    found = false; 
    for (let d_id of courseElective.distribution_ids) {
      await distributions
        .findById(d_id)
        .then(async (dist) => {
          if (dist.name === "Upper Level Electives") {
            found = true; 
            expect(dist.planned).toBe(9);
            expect(dist.satisfied).toBeTruthy();
          }
        })
    }
    expect(found).toBeTruthy();
  }); 
});

const data = { test: true };