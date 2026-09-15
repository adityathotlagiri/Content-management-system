import { Request, Response, NextFunction } from "express";
import * as enrollmentService from "../services/enrollment.service";

export async function enroll(req: Request, res: Response, next: NextFunction) {
  try {
    const { studentId, courseId, courseName } = req.body;
    const enrollment = await enrollmentService.enrollStudent(studentId, courseId, courseName);
    res.status(201).json(enrollment);
  } catch (err) {
    next(err);
  }
}

export async function listForCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const enrollments = await enrollmentService.listEnrollmentsForCourse(
      req.params.courseId as string
    );
    res.json(enrollments);
  } catch (err) {
    next(err);
  }
}