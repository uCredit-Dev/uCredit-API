//two distribution fields for each student
const samples = [
  {
    user_id: 'csStudent',
    name: 'H/S',
    required: 18,
  },
  {
    user_id: 'csStudent',
    name: 'core',
    required: 42,
  },
  {
    user_id: 'mathStudent',
    name: 'BS',
    required: 42,
  },
  {
    user_id: 'mathStudent',
    name: 'core',
    required: 42,
  },
  {
    user_id: 'bioStudent',
    name: 'math',
    required: 24,
  },
  {
    user_id: 'bioStudent',
    name: 'core',
    required: 42, // FAULT: Required field not created correctly
  },
];

function addSampleDistributions(distributions) {
  distributions.countDocuments({}, function (err, count) {
    if (err) {
      console.log(err);
    } else {
      if (count === 0) distributions.insertMany(samples);
    }
  });
}

export default { addSampleDistributions };
