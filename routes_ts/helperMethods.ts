import { Response } from "express";
import { DistributionDoc } from "../model_ts/Distribution";
import { CourseDoc } from "../model_ts/Course";
import { SISCourseVDoc } from "../model_ts/SISCourseV";

function returnData(data: any, res: Response) {
  data
    ? res.json({ data: data })
    : errorHandler(res, 404, "Resource not found");
}

function errorHandler(res: Response, status: number, err: any) {
  if (res.headersSent) return;
  res.status(status).json({
    errors: [
      {
        status: status,
        detail: err.message || err,
      },
    ],
  });
}

function forbiddenHandler(res: Response) {
  if (res.headersSent) return;
  res.status(403).json({
    status: 403,
    message: "You are not authorized to access this resource.",
  });
}

function missingHandler(res: Response, required: any) {
  if (res.headersSent) return;
  res.status(400).json({
    status: 400,
    message: "Request is missing required fields",
    required,
  });
}

async function distributionCreditUpdate(
  distribution: DistributionDoc,
  course: CourseDoc,
  add: boolean
) {
  if (!distribution) return;
  if (add) {
    distribution.planned += course.credits;
    if (course.taken) {
      distribution.current += course.credits;
    }
  } else {
    distribution.planned -= course.credits;
    if (course.taken) {
      distribution.current -= course.credits;
    }
  }
  distribution.satisfied =
    distribution.planned >= distribution.required ? true : false;
  await distribution.save();
}

// return true if userCourse is offered in newTerm
const checkDestValid = (
  sisCourses: SISCourseVDoc[],
  userCourse: CourseDoc,
  newTerm: string
) => {
  if (sisCourses.length == 0) return true;
  for (let sisC of sisCourses) {
    if (sisC.number === userCourse.number) {
      for (let term of sisC.terms) {
        // example: "Fall 2021" includes "Fall"
        if (term.includes(newTerm)) return true;
      }
    }
  }
  return false;
};

export {
  returnData,
  errorHandler,
  forbiddenHandler,
  missingHandler,
  distributionCreditUpdate,
  checkDestValid,
};
