import fs from 'fs';
import util from 'util';
import path from 'path';
const readFile = util.promisify(fs.readFile);

/*
    This function reads a json file that contains raw course data pulled from SIS
    and filters duplicate courses based on course number and write the filtered array
    into a new json file.
*/
async function cleanDup(file) {
  //read file
  let data = await readFile(path.resolve(__dirname, '../' + file), 'utf-8');
  data = JSON.parse(data.toString());
  console.log('length before filter is ' + data.length);

  const filteredCourses = [];
  for (let i in data) {
    const course = data[i];
    //check if course is a dup
    const index = filteredCourses.findIndex(
      (e) => e.OfferingName == course.OfferingName,
    );
    if (index == -1) {
      filteredCourses.push(course);
    }
  }
  console.log('length after filter is ' + filteredCourses.length);

  //write to new file
  const output = JSON.stringify(filteredCourses);
  fs.writeFile(
    'ftr' + fileName, //new file name
    output,
    { encoding: 'utf-8' },
    function (err, result) {
      if (err) console.log(err);
    },
  );
}

const fileName = 'FA2021.json';
cleanDup(fileName);

export default { cleanDup };
