import axios from 'axios';
import db from './db.js';
import evaluation from '../model/Evaluation.js';

db.connect()
  .then(() => {
    axios
      .get('https://jhu-course-rating-api.herokuapp.com/courses')
      .then((res) => {
        let evals = res.data;
        for (element of evals) {
          delete element._id;
        }
        evaluation.insertMany(evals).then((c) => console.log('completed'));
      })
      .catch((err) => console.log(err));
  })
  .catch((err) => console.log(err));
