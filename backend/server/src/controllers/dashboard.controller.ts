import { Request, Response, NextFunction } from "express";
import * as dashboardService from "../services/dashboard.service";

export async function getTeacherDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const { courseId, assignmentId, status, lateOnly, dateFrom, dateTo } = req.query;
    const result = await dashboardService.getTeacherGradingDashboard(
      req.params.teacherId as string,
      {
        courseId: courseId as string | undefined,
        assignmentId: assignmentId as string | undefined,
        status: status as string | undefined,
        lateOnly: lateOnly === "true",
        dateFrom: dateFrom as string | undefined,
        dateTo: dateTo as string | undefined,
      }
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}
export async function getStudentDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await dashboardService.getStudentDashboard(req.params.studentId as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
}