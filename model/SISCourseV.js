import mongoose from 'mongoose';
const Schema = mongoose.Schema;

/*  
    This model refers to courses retrieved from the SIS API.
*/

const courseSchema = new Schema({
  title: { type: String, required: true },
  number: { type: String, required: true },
  terms: [{ type: String, required: true }],
  versions: [
    {
      areas: { type: String, required: true },
      term: { type: String, required: true },
      school: { type: String, required: true },
      department: { type: String, default: 'Unspecified' },
      credits: { type: Number, required: true },
      wi: { type: Boolean, required: true },
      bio: { type: String },
      level: { type: String },
      tags: [{ type: String }],
      preReq: { type: Array },
      postReq: [{
        courseId: { type: String },
        number: { type: String },
        title: { type: String },
        versions: [{
          credits: { type: String },
          preReqs: { type: String },
          term: {type: String},
        }]
      }], 
      coReq: { type: Array },
      restrictions: { type: Array },
    },
  ],
});

export default mongoose.model('SISCourseV', courseSchema);
