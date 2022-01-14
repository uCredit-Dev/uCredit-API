require("dotenv").config();
const db = require("./db");
const ExperimentDao = require("./ExperimentDao");

const experiments = new ExperimentDao();

async function addJhedToWhiteList() {
  await db.connect();
  const jhed = "mliu78" //Change this variable to your jhed to be added to the white list
  const whiteList = await experiments.updateAdd("White List", jhed);
  console.log(
    whiteList,
  );
}

addJhedToWhiteList()
  .then(() => {
    console.log("Adding to White List");
    console.log("Please terminate the process by Ctrl + C");
  })
  .catch((err) => console.log(err));