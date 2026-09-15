// server/src/middleware/validate.ts
import { Request, Response, NextFunction } from "express";

// Fields required to create an assignment (Task 2's field list, minus
// optional ones like instructions/latePenaltyPercent).
const REQUIRED_ASSIGNMENT_FIELDS = [
  "title",
  "description",
  "courseId",
  "courseName",
  "assignmentType",
  "difficultyLevel",
  "maxMarks",
  "passingMarks",
  "startDate",
  "submissionDeadline",
  "allowedFileTypes",
  "maxFileSizeMb",
  "createdById",
];

export function validateCreateAssignment(req: Request, res: Response, next: NextFunction) {
  const missing = REQUIRED_ASSIGNMENT_FIELDS.filter((field) => {
    const value = req.body[field];
    return value === undefined || value === null || value === "";
  });

  if (missing.length > 0) {
    return res.status(400).json({
      error: `Missing required fields: ${missing.join(", ")}`,
    });
  }

  if (req.body.passingMarks > req.body.maxMarks) {
    return res.status(400).json({
      error: "passingMarks cannot exceed maxMarks",
    });
  }

  if (new Date(req.body.submissionDeadline) <= new Date(req.body.startDate)) {
    return res.status(400).json({
      error: "submissionDeadline must be after startDate",
    });
  }

  next();
}