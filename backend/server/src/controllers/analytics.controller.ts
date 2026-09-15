import { Request, Response, NextFunction } from "express";
import * as analyticsService from "../services/analytics.service";

export async function getAssignmentAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await analyticsService.getAssignmentAnalytics(req.params.assignmentId as string);
    res.json(result);
  } catch (err) {
    if (err instanceof Error) return res.status(400).json({ error: err.message });
    next(err);
  }
}