import db from "./db";
import ExperimentDao from "./ExperimentDao";

const experiments = new ExperimentDao();

async function createSampleData() {
  await db.connect(); // this should not be your production database!!

  const experiment1 = await experiments.create({
    name: "Red Button",
    blacklist: [],
    active: ["wtong10", "mtiavis1"],
  });

  const experiment2 = await experiments.create({
    name: "Blue Button",
    blacklist: ["mtiavis1"],
    active: ["wtong10"],
  });

  const experiment3 = await experiments.create({
    name: "Green Button",
    blacklist: ["wtong10"],
    active: ["mtiavis1"],
  });

  const whiteList = await experiments.create({
    name: "White List",
    blacklist: [],
    active: ["mtiavis1", "wtong10"],
  });

  console.log(experiment1, experiment2, experiment3, whiteList);
}

createSampleData()
  .then(() => {
    console.log("Finished creating samples!");
    console.log("Please terminate the process by Ctrl + C");
  })
  .catch((err) => console.log(err));
