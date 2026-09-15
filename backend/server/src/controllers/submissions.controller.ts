/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from "express";
import * as submissionsService from "../services/submissions.service";
import { prisma } from "../lib/prisma";

export async function submitAssignment(req: Request, res: Response, next: NextFunction) {
  try {
    const submission = await submissionsService.submitAssignment(req.body);
    res.status(201).json(submission);
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

export async function listForAssignment(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, page, pageSize } = req.query;
    const result = await submissionsService.listSubmissionsForAssignment(
      req.params.assignmentId as string,
      {
        status: status as any,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      }
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getStudentSubmissions(req: Request, res: Response, next: NextFunction) {
  try {
    const submissions = await submissionsService.getStudentSubmissions(req.params.studentId as string);
    res.json(submissions);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const submission = await submissionsService.getSubmissionById(req.params.id as string);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }
    res.json(submission);
  } catch (err) {
    next(err);
  }
}

export async function requestResubmission(req: Request, res: Response, next: NextFunction) {
  try {
    const { teacherId, reason } = req.body;
    const updated = await submissionsService.requestResubmission(
      req.params.id as string,
      teacherId,
      reason
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
}
export async function finalizeGrade(req: Request, res: Response, next: NextFunction) {
  try {
    const { finalScore, teacherApproved, reviewedById, teacherComment } = req.body;
    const submissionId = req.params.id as string;

    const result = await prisma.$transaction(async (tx) => {
      const gradingResult = await tx.aIGradingResult.update({
        where: { submissionId },
        data: {
          finalScore,
          teacherApproved,
          reviewedById,
          reviewedAt: new Date(),
        },
      });

      const submission = await tx.assignmentSubmission.update({
        where: { id: submissionId },
        data: { status: "GRADED" },
      });

      await tx.assignmentAuditLog.create({
        data: {
          assignmentId: submission.assignmentId,
          userId: reviewedById,
          action: teacherApproved ? "GRADE_APPROVED" : "GRADE_MODIFIED",
          previousValue: { suggestedScore: gradingResult.suggestedScore },
          newValue: { finalScore, teacherComment },
        },
      });
      await tx.notification.create({
        data: {
          userId: submission.studentId,
          type: "GRADE_PUBLISHED",
          title: "Grade published",
          message: `Your grade for this assignment is now available.`,
          assignmentId: submission.assignmentId,
          submissionId,
        },
      });
      return { submission, gradingResult };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}