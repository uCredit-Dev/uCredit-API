// helper methods for updating distributions 

// returns if a course satisfies a criteria
const checkCriteriaSatisfied = (criteria, course) => {
  if (criteria === null || criteria.length === 0 || criteria === "N/A") {
    return true;
  }
  const splitArr = splitRequirements(criteria);
  const boolExpr = getCriteriaBoolExpr(splitArr, course);
  return boolExpr.length !== 0 ? eval(boolExpr) : false; 
};

// returns a string expression of whether a course satisfies a criteria
const getCriteriaBoolExpr = (splitArr, course) => {
  let boolExpr = "";
  let index = 0;
  let concat = "";
  if (course === null) {
    return concat;
  }
  while (index < splitArr.length) {
    if (splitArr[index] === "(") {
      concat = "(";
    } else if (splitArr[index] === ")") {
      concat = ")";
    } else if (splitArr[index] === "OR") {
      concat = "||";
    } else if (splitArr[index] === "AND") {
      concat = "&&";
    } else if (splitArr[index] === "NOT") {
      concat = index == 0 ? "!" : "&&!"; 
    } else {
      concat = handleTagType(splitArr, index, course);
    }
    if (concat.length > 3) {
      index = index + 2;
    } else index++;
    boolExpr = boolExpr.concat(concat); // Causing issues with biology major.
  }
  return boolExpr;
};

// handles different tags (C, T, D, Y, A, N, W, L) in criteria string
const handleTagType = (splitArr, index, course) => {
  let updatedConcat;
  switch (splitArr[index + 1]) {
    case "C": // Course Number
      updatedConcat = (
        course.number !== undefined && course.number.includes(splitArr[index])
      ).toString();
      break;
    case "T": // Tag
      updatedConcat = (
        course?.tags !== undefined && course.tags.includes(splitArr[index])
      ).toString();
      break;
    case "D": // Department
      updatedConcat = (course.department === splitArr[index]).toString();
      break;
    case "Y": // Year
      //TODO: implement for year.
      updatedConcat = "false";
      break;
    case "A": // Area
      updatedConcat = (
        course.areas !== undefined && course.areas !== "None" && course.areas.includes(splitArr[index])
      ).toString();
      break;
    case "N": // Name
      updatedConcat = (
        course.title !== undefined && course.title.includes(splitArr[index])
      ).toString();
      break;
    case "W": //Written intensive
      updatedConcat = (course.wi !== undefined && course.wi).toString();
      break;
    case "L": // Level
      updatedConcat = handleLCase(splitArr, index, course);
      break;
    default:
      updatedConcat = "false";
  }
  return updatedConcat;
};

// Handles the L case in the getBoolExpr function
const handleLCase = (splitArr, index, course) => {
  let updatedConcat = false;
  if (splitArr[index].includes("Upper")) {
    updatedConcat = course.level.includes("Upper");
  } else if (splitArr[index].includes("Lower")) {
    updatedConcat = course.level.includes("Upper"); 
  } else  {
    updatedConcat = (course.number !== undefined && course.number[7] === splitArr[index][0]); 
  } 
  return updatedConcat.toString();
};

// args: expression for requirments
// returns: an array where each entry is one of a requirement (always followed by type of requirement), parentheses, OR/AND,
const splitRequirements = (expr) => {
  let out = [];
  let index = 0;
  while (index < expr.length) {
    let pair = getNextEntry(expr, index);
    out.push(pair[0]);
    index = pair[1];
  }
  return out;
};

// args: expr to parse, index that we are currently on
// returns: the next piece, along with the index of start of the next next piece
const getNextEntry = (expr, index) => {
  if (expr[index] === "(") {
    return ["(", index + 1];
  } else if (expr[index] === ")") {
    return [")", index + 1];
  } else if (expr[index] === "[") {
    return [expr[index + 1], index + 3];
  } else if (expr[index] === "^") {
    if (expr[index + 1] === "O") {
      return ["OR", index + 4];
    } else if (expr[index + 1] === "A") {
      return ["AND", index + 5];
    } else {
      return ["NOT", index + 5];
    }
  }
  let out = expr[index];
  index++;
  while (index < expr.length) {
    if (
      expr[index] === "(" ||
      expr[index] === ")" ||
      expr[index] === "[" ||
      expr[index] === "^"
    ) {
      return [out, index];
    }
    out = out.concat(expr[index]);
    index++;
  }
  return [out, index];
};

export {
  splitRequirements, 
  getCriteriaBoolExpr
}; 