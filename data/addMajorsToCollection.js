/*
    If you want to add majors to the production majors collection, 
    first add them to majors.js and allMajors array.
    Then run this script.
*/

import * as db from "./db.js"; 
import { allMajors } from "./majors.js"; 
import Majors from "../model/Major.js"; 
import e from "cors";

// addAllMajors(); 
updateAllMajors(); 

// Add ALL majors in allMajors array to production DB
async function addAllMajors() {
  await db.connect(); // comment out this line before running jest test
  let new_count = 0; 
  for (let major of allMajors) {
    const existing_major = await majors.findById(major); 
    if (!existing_major) {
      majors.insert(major)
        .then((res) => {
          console.log(`added new degree: ${res.data}`); 
          new_count++; 
        })
        .catch((err) => console.log(err)); 
    } else {
      console.log(`${major._id} already exists!`); 
    }
  }
  console.log(console.log(`Done adding ${new_count} new majors! Check DB to confirm the documents have been added to the collection`));
}

// Add ALL majors in allMajors array to production DB
async function updateAllMajors() {
  await db.connect(); // comment out this line before running jest test
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
  console.log(console.log(`Done adding ${new_count} new majors and updating ${update_count} existing majors! Check DB to confirm.`));
}

// Add a specified major in allMajors array to production DB
async function addOneMajor(majorName) {
  await db.connect(); // comment out this line before running jest test
  let documentAdded = false;
  for (let major of allMajors) {
    if (major._id === majorName) {
      await Majors
        .create(major)
        .then((majorDocument) => {
          documentAdded = true;
          console.log(majorDocument._id + " added.");
          console.log(
            "Done! Check DB to confirm the document has been added to the collection."
          );
        })
        .catch((err) => console.log(err));
    }
  }
  if (!documentAdded) {
    console.log("No documents were added to the collection.");
  }
}

// module.exports = {
//   addAllMajors,
//   addOneMajor,
// };
