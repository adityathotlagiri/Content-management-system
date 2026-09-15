import { Request, Response, NextFunction } from "express";
import * as assignmentsService from "../services/assignments.service";
import { AssignmentStatus } from "@prisma/client";

export async function createAssignment(req: Request, res: Response, next: NextFunction) {
  try {
    const assignment = await assignmentsService.createAssignment(req.body);
    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
}

export async function listAssignments(req: Request, res: Response, next: NextFunction) {
  try {
    const { courseId, status, page, pageSize } = req.query;
    const result = await assignmentsService.listAssignments({
      courseId: courseId as string | undefined,
      status: status as AssignmentStatus | undefined,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getAssignmentById(req: Request, res: Response, next: NextFunction) {
  try {
    const assignment = await assignmentsService.getAssignmentById(req.params.id as string);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    res.json(assignment);
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, userId } = req.body;
    const updated = await assignmentsService.updateAssignmentStatus(
      req.params.id as string,
      status,
      userId
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function duplicateAssignment(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.body;
    const clone = await assignmentsService.duplicateAssignment(req.params.id as string, userId);
    res.status(201).json(clone);
  } catch (err) {
    next(err);
  }
}

export async function archiveAssignment(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.body;
    const archived = await assignmentsService.archiveAssignment(req.params.id as string , userId);
    res.json(archived);
  } catch (err) {
    next(err);
  }
}