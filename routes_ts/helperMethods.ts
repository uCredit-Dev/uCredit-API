import { Request, Response } from "express";

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

export { returnData, errorHandler, forbiddenHandler, missingHandler };