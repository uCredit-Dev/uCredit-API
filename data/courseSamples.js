const samples = [
  {
    user_id: "csStudent",
    distribution_ids: ["6001b745e5fd0d8124251e51"],
    title: "Gateway Computing: Java",
    number: "500.112",
    term: "fall",
    credits: 3,
  },
  {
    user_id: "csStudent",
    distribution_ids: ["6001b745e5fd0d8124251e50"],
    title: "expos",
    number: "201.220",
    term: "spring",
    wi: true,
    credits: 3,
  },
  {
    user_id: "mathStudent",
    distribution_ids: ["6001b745e5fd0d8124251e53"],
    title: "Cryptography",
    number: "301.227",
    term: "summer",
    credits: 3,
  },
  {
    user_id: "mathStudent",
    distribution_ids: ["6001b745e5fd0d8124251e54"],
    title: "physics",
    number: "301.280",
    term: "fall",
    credits: 4,
  },
  {
    user_id: "bioStudent",
    distribution_ids: ["6001b745e5fd0d8124251e54"],
    title: "Linear Algebra",
    number: "501.421",
    term: "spring",
    credits: 4,
  },
];

function addSampleCourses(courses) {
  courses.countDocuments({}, function (err, count) {
    if (err) {
      console.log(err);
    } else {
      if (count === 0) courses.insertMany(samples);
    }
  });
}

export default { addSampleCourses };
