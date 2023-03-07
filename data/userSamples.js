//three users with no courses/distribution added yet.
const samples = [
  {
    _id: "csStudent",
    major: "cs",
  },
  {
    _id: "mathStudent",
    major: "math",
  },
  {
    _id: "bioStudent",
    major: "bio", // FAULT: unneeded
  },
];

function addSampleUsers(users) {
  users.countDocuments({}, function (err, count) {
    if (err) {
      console.log(err);
    } else {
      if (count === 0) users.insertMany(samples);
    }
  });
}

export default { addSampleUsers };
