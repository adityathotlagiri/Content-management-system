import { Request, Response, NextFunction } from "express";
import * as rubricService from "../services/rubric.service";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const rubric = await rubricService.createRubric(req.body);
    res.status(201).json(rubric);
  } catch (err) {
    if (err instanceof Error) return res.status(400).json({ error: err.message });
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const rubrics = await rubricService.listRubrics(req.params.createdById as string);
    res.json(rubrics);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const rubric = await rubricService.getRubricById(req.params.id as string);
    if (!rubric) return res.status(404).json({ error: "Rubric not found" });
    res.json(rubric);
  } catch (err) {
    next(err);
  }
}

export async function attach(req: Request, res: Response, next: NextFunction) {
  try {
    const { rubricId } = req.body;
    const assignment = await rubricService.attachRubricToAssignment(
      req.params.assignmentId as string,
      rubricId
    );
    res.json(assignment);
  } catch (err) {
    next(err);
  }
}