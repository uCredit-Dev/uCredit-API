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
    major: "bio",
  },
];

async function addSampleUsers(users) {
  //user collection is empty
  if (users.countDocuments({}) === 0) {
    for (let i = 0; i < samples.length; i++) {
      const sample = samples[i];
      await users.create(sample._id, sample.major);
    }
  }
}

module.exports = { addSampleUsers };
