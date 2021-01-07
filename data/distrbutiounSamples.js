//two distribution fields for each student
const sampels = [
  {
    user_id: "csStudent",
    _id: "csH/S",
    name: "H/S",
    required: 18,
  },
  {
    user_id: "csStudent",
    _id: "csCore",
    name: "core",
    required: 42,
  },
  {
    user_id: "mathStudent",
    _id: "mathBS",
    name: "BS",
    required: 42,
  },
  {
    user_id: "mathStudent",
    _id: "mathCore",
    name: "core",
    required: 42,
  },
  {
    user_id: "bioStudent",
    _id: "bioMath",
    name: "math",
    required: 24,
  },
  {
    user_id: "bioStudent",
    _id: "bioCore",
    name: "core",
    required: 42,
  },
];

async function addSampleDistributions(distirbutions) {
  //distribution collection is empty
  if (distributions.countDocuments({}) === 0) {
    distributions.insertMany(samples);
  }
}

module.exports = { addSampleDistributions };
