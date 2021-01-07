const samples = [
  {
    user_id: "csStudent",
    distribution_ids: ["csCore"],
    title: "Gateway Computing: Java",
    number: "500.112",
    term: "fall",
    credits: 3,
  },
  {
    user_id: "csStudent",
    distribution_ids: ["csH/S"],
    title: "expos",
    number: "201.220",
    term: "spring",
    wi: true,
    credits: 3,
  },
  {
    user_id: "mathStudent",
    distribution_ids: ["mathCore"],
    title: "Cryptography",
    number: "301.227",
    term: "Summer",
    credits: 3,
  },
  {
    user_id: "mathStudent",
    distribution_ids: ["mathBS"],
    title: "physics",
    number: "301.280",
    term: "fall",
    credits: 4,
  },
  {
    user_id: "bioStudent",
    distribution_ids: ["bioMath"],
    title: "Linear Algebra",
    number: "501.421",
    term: "spring",
    credits: 4,
  },
];

async function addSampleCourses(courses) {
  //course collection is empty
  if (courses.countDocuments({}) === 0) {
    courses.insertMany(samples);
  }
}

module.exports = { addSampleCourses };
