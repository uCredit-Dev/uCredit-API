import { connect } from './db.js';
import dotenv from 'dotenv';
import SISCourseV from '../model/SISCourseV.js';
dotenv.config();

// updateIntroAlgo();
checkUpdated();

/* 
  Script to update the intro algo prereq 
*/
async function updateIntroAlgo() {
  connect();
  const number = 'EN.601.433';
  const newPrereq = [
    {
      Description:
        'EN.600.226/EN.601.226 AND (EN.553.171/EN.550.171 OR EN.553.172/EN.550.170 OR EN.600.271/EN.601.231 OR EN.601.230',
      Expression:
        'EN.600.226[C]^AND^(^EN.553.171[C]^OR^EN.553.172[C]^OR^EN.600.271[C]^OR^EN.601.230[C]^)',
      IsNegative: 'N',
    },
    {
      Description:
        'Students may receive credit for only one of EN.600.363, EN.600.463, EN.601.433, EN.601.633.',
      Expression: 'EN.600.363[C]^OR^EN.601.633[C]',
      IsNegative: 'Y',
    },
  ];

  let data = await SISCourseV.find({ number });
  let course = data[0];
  for (let version of course.versions) {
    version.preReq = newPrereq;
  }
  await course.save();
  console.log('done!');
}

async function checkUpdated() {
  connect();
  const number = 'EN.601.433';
  let data = await SISCourseV.find({ number });
  let course = data[0];

  for (let version of course.versions) {
    console.log(version.preReq);
  }
}

/* 
const oldPrereq = [
    {
      Description:
        'EN.600.226/EN.601.226 AND (EN.553.171/EN.550.171 OR EN.553.172/EN.550.170 OR EN.600.271/EN.601.231',
      Expression:
        'EN.600.226[C]^AND^(^EN.553.171[C]^OR^EN.553.172[C]^OR^EN.600.271[C]^)',
      IsNegative: 'N',
    },
    {
      Description:
        'Students may receive credit for only one of EN.600.363, EN.600.463, EN.601.433, EN.601.633.',
      Expression: 'EN.600.363[C]^OR^EN.601.633[C]',
      IsNegative: 'Y',
    },
  ];
  */ 
