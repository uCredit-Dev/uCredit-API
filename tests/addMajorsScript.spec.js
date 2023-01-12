const mongoose = require("mongoose");
const supertest = require("supertest");
const { returnData } = require("../routes/helperMethods");
const majors = require("../model/Major");
const createApp = require("../app");
const { allMajors } = require("../data/majors");
const { addAllMajors, addOneMajor } = require("../data/addMajorsToCollection")

beforeAll((done) => {
    mongoose
      .connect("mongodb://localhost:27017/majors", {poolSize: 10, bufferMaxEntries: 0, reconnectTries: 5000, useNewUrlParser: true})
      .then(() => done());
  });
  
  afterAll((done) => {
     mongoose.connection.db.collection("asdf").drop(() => {
      mongoose.connection.close(() => done());
     });
    //     await mongoose.connection.close()
    // mongoose.connection.close();
  });


describe("Create majors in production DB", () => {
    // it("should create one new major", async () => {
    //     addOneMajor("B.S. Molecular and Cellular Biology");
    // });
    it("should create all majors", async () => {
        addAllMajors();
    });
});

const data = { test: true };
