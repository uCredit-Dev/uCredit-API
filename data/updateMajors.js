/*
    If you want to add majors to the production majors collection, 
    first add them to majors.js and allMajors array.
    Then run this script.
*/

import * as db from './db.js';
import { allMajors } from './majors.js';
import Majors from '../model/Major.js';

// addAllMajors();
updateAllMajors();

// add majors in allMajors array if not already in production DB
async function addAllMajors() {
  await db.connect(); 
  let new_count = 0;
  for (let major of allMajors) {
    const existing_major = await Majors.findById(major);
    if (!existing_major) {
      Majors
        .insert(major)
        .then((res) => {
          console.log(`added new degree: ${res.data}`);
          new_count++;
        })
        .catch((err) => console.log(err));
    } else {
      console.log(`${major._id} already exists!`);
    }
  }
  console.log(`Done adding ${new_count} new majors! Check DB to confirm the documents have been added to the collection`);
}

// add new majors and update existing ones in production DB
async function updateAllMajors() {
  await db.connect(); 
  let new_count = 0;
  let update_count = 0;
  for (let major of allMajors) {
    const existing_major = await Majors.findById(major._id);
    if (existing_major) {
      await Majors.findByIdAndDelete(major._id);
      update_count++;
      console.log(`updated existing degree: ${major._id}`);
    } else {
      new_count++;
      console.log(`added new degree: ${major._id}`);
    }
    try {
      await Majors.create(major);
    } catch (err) {
      console.log(err);
    }
  }
  console.log(`Done adding ${new_count} new majors and updating ${update_count} existing majors! Check DB to confirm.`);
}

// Add a specified major in allMajors array to production DB
// majorName is _id of the major
async function addOneMajor(majorName) {
  await db.connect(); 
  let documentAdded = false;
  for (let major of allMajors) {
    if (major._id === majorName) {
      // found specified major 
      await Majors.create(major)
        .then((majorDocument) => {
          documentAdded = true;
          console.log(majorDocument._id + ' added.');
          console.log(
            'Done! Check DB to confirm the document has been added to the collection.',
          );
        })
        .catch((err) => console.log(err));
      break; 
    }
  }
  if (!documentAdded) {
    console.log('No documents were added to the collection.');
  }
}