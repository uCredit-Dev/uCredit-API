import mongoose from "mongoose";
import experimentDAO from "../../data/ExperimentDAO";

const DAO = new experimentDAO();

const JUNIOR = "AE UG JUNIOR";
beforeEach((done) => {
  mongoose
    .connect("mongodb://localhost:27017/experimentDAO", {
      useNewUrlParser: true,
    })
    .then(async () => {
      done();
    });
});

afterEach((done) => {
  mongoose.connection.db.collection("experimentDAO").drop(() => {
    mongoose.connection.close(() => done());
  });
});

describe("ExperimentDAO CRUD Operations", () => {
  it("Test create experiment", async () => {
    const experiment = {
      name: "testExperiment",
      blacklist: [],
      active: [],
    };

    const ex = await DAO.create(experiment);
    expect(ex.experimentName).toBe(experiment.name);
    expect(ex.blacklist.length).toEqual(experiment.blacklist.length);
    expect(ex.active.length).toEqual(experiment.active.length);
    expect(ex.percent_participating).toBe(0);
    expect(ex._id).toBeDefined();
  });

  it("Test create INVALID EMPTY EXPERIMENT", async () => {
    try {
      const ex = await DAO.createExperiment({});
      fail(
        "Should have errored when invalid experiment was attempted to delete"
      );
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it("Test create INVALID NO NAME", async () => {
    const experiment = {
      blacklist: [],
      active: [],
    };
    try {
      const ex = await DAO.createExperiment(experiment);
      fail("Should have errored when no name was provided");
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it("Test create INVALID NO BLACKLIST", async () => {
    const experiment = {
      name: "testExperiment",
      active: [],
    };
    try {
      const ex = await DAO.createExperiment(experiment);
      fail("Should have errored when no blacklist was provided");
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it("Test create INVALID NO ACTIVE", async () => {
    const experiment = {
      name: "testExperiment",
      blacklist: [],
    };
    try {
      const ex = await DAO.createExperiment(experiment);
      fail("Should have errored when no active was provided");
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it("Test updateAdd", async () => {
    const experiment = {
      name: "testExperiment",
      blacklist: [],
      active: [],
    };

    const ex = await DAO.create(experiment);

    const ex2 = await DAO.updateAdd(experiment.name, "testUser");

    expect(ex2.experimentName).toBe(experiment.name);
    expect(ex2.blacklist.length).toEqual(experiment.blacklist.length);
    expect(ex2.active.length).toEqual(experiment.active.length + 1);
  });

  it("Test updateAdd INVALID NAME", async () => {
    try {
      const ex = await DAO.updateAdd("InVALIDNAME!", "testUser");
      fail("Should have errored when invalid name was provided");
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it("Test updateAdd INVALID NO USER", async () => {
    try {
      const ex = await DAO.updateAdd(experiment.name, "");
      fail("Should have errored when invalid user was provided");
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it("Test updateDelete", async () => {
    const experiment = {
      name: "testExperiment",
      blacklist: [],
      active: ["testUser"],
    };
    await DAO.create(experiment);

    const ex2 = await DAO.updateDelete(experiment.name, "testUser");

    expect(ex2.experimentName).toBe(experiment.name);
    expect(ex2.blacklist.length).toEqual(experiment.blacklist.length + 1);
    expect(ex2.active.length).toEqual(experiment.active.length - 1);
  });

  it("Test updateDelete INVALID", async () => {
    try {
      const ex = await DAO.updateDelete("InVALIDNAME!", "testUser");
      fail(
        "Should have errored when invalid experiment was attempted to delete"
      );
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it("Test updateDelete INVALID NO USER", async () => {
    try {
      const ex = await DAO.updateDelete(experiment.name, "");
      fail("Should have errored when invalid user was attempted to delete");
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it("Test updateName", async () => {
    const experiment = {
      name: "testExperiment",
      blacklist: [],
      active: ["testUser"],
    };
    await DAO.create(experiment);

    const ex = await DAO.updateName(experiment.name, "testExperiment2");

    expect(ex.experimentName).toBe("testExperiment2");
    expect(ex.blacklist.length).toEqual(experiment.blacklist.length);
    expect(ex.active.length).toEqual(experiment.active.length);
    expect(ex._id).toBeDefined();
  });

  it("Test updateName INVALID", async () => {
    try {
      const ex = await DAO.updateName("InVALIDNAME!", "testExperiment2");
      fail("Should have errored when invalid name was attempted to update");
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it("Test updateName INVALID NO NAME", async () => {
    try {
      const ex = await DAO.updateName(experiment.name, "");
      fail(
        "Should have errored when invalid experiment was attempted to update"
      );
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it("Test deleteExperiment VALID", async () => {
    const experiment = {
      name: "testExperiment",
      blacklist: [],
      active: ["testUser"],
    };
    await DAO.create(experiment);

    const ex = await DAO.deleteExperiment(experiment.name);
    expect(ex.experimentName).toBe(experiment.name);
    expect(ex.blacklist.length).toEqual(experiment.blacklist.length);
    expect(ex.active.length).toEqual(experiment.active.length);
    expect(ex._id).toBeDefined();
  });

  it("Test deleteExperiment INVALID", async () => {
    try {
      const ex = await DAO.deleteExperiment(experiment.name);
      fail(
        "Should have errored when invalid experiment was attempted to delete"
      );
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it("Test updateParticipation", async () => {
    const experiment = {
      name: "testExperiment",
      blacklist: [],
      active: ["testUser"],
    };
    await DAO.create(experiment);

    const ex = await DAO.updateParticipation(experiment.name, 0);
    console.log(ex);

    expect(ex.experimentName).toBe(experiment.name);
    expect(ex.percent_participating).toBe(0);
    expect(ex._id).toBeDefined();
  });

  it("Test updateParticipation INVALID NAME", async () => {
    //BAD NAME
    try {
      const ex = await DAO.updateParticipation("White List", 0);
      fail(
        "Should have errored when invalid experiment was attempted to update"
      );
    } catch (err) {
      expect(err).toBeDefined();
    }
    //BAD NUMBER
    try {
      const ex = await DAO.updateParticipation("test", -1);
      fail(
        "Should have errored when invalid experiment was attempted to update"
      );
    } catch (err) {
      expect(err).toBeDefined();
    }

    try {
      const ex = await DAO.updateParticipation("test", NaN);
      fail(
        "Should have errored when invalid experiment was attempted to update"
      );
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it("Test updateParticipation INVALID NUMBER", async () => {
    //BAD NUMBER
    try {
      const ex = await DAO.updateParticipation("test", -1);
      fail(
        "Should have errored when invalid experiment was attempted to update"
      );
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it("Test updateParticipation NO NUMBER", async () => {
    try {
      const ex = await DAO.updateParticipation("test", NaN);
      fail(
        "Should have errored when invalid experiment was attempted to update"
      );
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it("Test retrieveAll()", async () => {
    let ex = await DAO.retrieveAll();
    expect(ex.length).toBeGreaterThan(0);
  });

  it("Test readAll() noUser", async () => {
    const user = "INVALIDUSER";
    try {
      const ex = await DAO.readAll({ user });
    } catch (err) {
      expect(err).toBeDefined();
    }
  });
});
