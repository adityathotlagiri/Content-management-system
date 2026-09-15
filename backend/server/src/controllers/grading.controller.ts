import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export async function getGradingResultBySubmission(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await prisma.aIGradingResult.findUnique({
      where: { submissionId: req.params.submissionId as string },
    });
    if (!result) {
      return res.status(404).json({ error: "No grading result found for this submission" });
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
}
export async function getRubricEvaluations(req: Request, res: Response, next: NextFunction) {
  try {
    const evaluations = await prisma.rubricEvaluation.findMany({
      where: { gradingResultId: req.params.gradingResultId as string },
      include: { criterion: true },
    });
    res.json(evaluations);
  } catch (err) {
    next(err);
  }
}

export async function overrideCriterionScore(req: Request, res: Response, next: NextFunction) {
  try {
    const { gradingResultId, criterionId, teacherScore } = req.body;
    const updated = await prisma.rubricEvaluation.update({
      where: { gradingResultId_criterionId: { gradingResultId, criterionId } },
      data: { teacherScore, teacherOverridden: true },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}