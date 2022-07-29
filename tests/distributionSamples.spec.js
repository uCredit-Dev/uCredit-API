const mongoose = require("mongoose");
const distributions = require("../model/User");
const { addSampleDistributions } = require("../data/distributionsamples");
const SAMPLES = [
  {
    useruser_id: "csStudent",
    name: "H/S",
    required: 18,
  },
  {
    useruser_id: "csStudent",
    name: "core",
    required: 42,
  },
  {
    useruser_id: "mathStudent",
    name: "BS",
    required: 42,
  },
  {
    useruser_id: "mathStudent",
    name: "core",
    required: 42,
  },
  {
    useruser_id: "bioStudent",
    name: "math",
    required: 24,
  },
  {
    useruser_id: "bioStudent",
    name: "core",
    required: 42,
  },
];

beforeAll((done) => {
  mongoose
    .connect("mongodb://localhost:27017/distributionSamples", {
      useNewUrlParser: true,
    })
    .then(() => {
      addSampleDistributions(distributions);
      done();
    });
});

afterAll((done) => {
  mongoose.connection.db.collection("distributionSamples").drop(() => {
    mongoose.connection.close(() => done());
  });
});

describe("distributionsamples should create new sample distributions", () => {
  it("distributionSamples should create 6 distributions", async () => {
    const distributionList = await distributions.find({}).exec();
    expect(distributionList.length).toBe(SAMPLES.length);
  });

  it("first distribution id should match first sample id", async () => {
    const distributionList = await distributions.find({}).exec();
    expect(distributionList[0].user_id).toBe(SAMPLES[0].user_id);
  });

  it("second student id should match for second sample id", async () => {
    const distributionList = await distributions.find({}).exec();
    expect(distributionList[1].user_id).toBe(SAMPLES[1].user_id);
  });

  it("third student id should match for third sample id", async () => {
    const distributionList = await distributions.find({}).exec();
    expect(distributionList[2].user_id).toBe(SAMPLES[2].user_id);
  });

  it("fourth student id should match for fourth sample id", async () => {
    const distributionList = await distributions.find({}).exec();
    expect(distributionList[3].user_id).toBe(SAMPLES[3].user_id);
  });

  it("fifth student id should match for fifth sample id", async () => {
    const distributionList = await distributions.find({}).exec();
    expect(distributionList[4].user_id).toBe(SAMPLES[4].user_id);
  });

  it("sixth student id should match for sixth sample id", async () => {
    const distributionList = await distributions.find({}).exec();
    expect(distributionList[5].user_id).toBe(SAMPLES[5].user_id);
  });

  it("first distribution name should match first sample name", async () => {
    const distributionList = await distributions.find({}).exec();
    expect(distributionList[0].name).toBe(SAMPLES[0].name);
  });

  it("second student name should match for second sample name", async () => {
    const distributionList = await distributions.find({}).exec();
    expect(distributionList[1].name).toBe(SAMPLES[1].name);
  });

  it("third student name should match for third sample name", async () => {
    const distributionList = await distributions.find({}).exec();
    expect(distributionList[2].name).toBe(SAMPLES[2].name);
  });

  it("fourth student name should match for fourth sample name", async () => {
    const distributionList = await distributions.find({}).exec();
    expect(distributionList[3].name).toBe(SAMPLES[3].name);
  });

  it("fifth student name should match for fifth sample name", async () => {
    const distributionList = await distributions.find({}).exec();
    expect(distributionList[4].name).toBe(SAMPLES[4].name);
  });

  it("sixth student name should match for sixth sample name", async () => {
    const distributionList = await distributions.find({}).exec();
    expect(distributionList[5].name).toBe(SAMPLES[5].name);
  });

  it("first distribution required credit count should match first sample required credit count", async () => {
    const distributionList = await distributions.find({}).exec();
    expect(distributionList[0].required).toBe(SAMPLES[0].required);
  });

  it("second student required credit count should match for second sample required credit count", async () => {
    const distributionList = await distributions.find({}).exec();
    expect(distributionList[1].required).toBe(SAMPLES[1].required);
  });

  it("third student required credit count should match for third sample required credit count", async () => {
    const distributionList = await distributions.find({}).exec();
    expect(distributionList[2].required).toBe(SAMPLES[2].required);
  });

  it("fourth student required credit count should match for fourth sample required credit count", async () => {
    const distributionList = await distributions.find({}).exec();
    expect(distributionList[3].required).toBe(SAMPLES[3].required);
  });

  it("fifth student required credit count should match for fifth sample required credit count", async () => {
    const distributionList = await distributions.find({}).exec();
    expect(distributionList[4].required).toBe(SAMPLES[4].required);
  });

  it("sixth student required credit count should match for sixth sample required credit count", async () => {
    const distributionList = await distributions.find({}).exec();
    expect(distributionList[5].required).toBe(SAMPLES[5].required);
  });

  it("should throw error for invalid parameter", async () => {
    try {
      addSampleDistributions(null);
      fail("should throw error");
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});
