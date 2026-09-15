import { prisma } from "../lib/prisma";
import { Prisma, SubmissionStatus } from "@prisma/client";
import { queueGradingForSubmission } from "./aiGrading.service";
import { createNotification } from "./notification.service";
export interface SubmitAssignmentInput {
  assignmentId: string;
  studentId: string;
  textAnswer?: string;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSizeBytes: number;
  }[];
}

export async function submitAssignment(input: SubmitAssignmentInput) {
  const submission = await prisma.$transaction(
    async (tx) => {
      const assignment = await tx.assignment.findUnique({
        where: { id: input.assignmentId },
      });
      if (!assignment) throw new Error("Assignment not found");
      if (assignment.status !== "PUBLISHED") {
        throw new Error("This assignment is not open for submissions");
      }

      // Count existing attempts for this student on this assignment to
      // enforce maxSubmissionAttempts and compute the next attempt number.
      const existingCount = await tx.assignmentSubmission.count({
        where: { assignmentId: input.assignmentId, studentId: input.studentId },
      });

      if (existingCount >= assignment.maxSubmissionAttempts) {
        throw new Error("Maximum submission attempts reached for this assignment");
      }

      const now = new Date();
      const isLate = now > assignment.submissionDeadline;

      if (isLate && !assignment.lateSubmissionAllowed) {
        throw new Error(
          "The submission deadline has passed and late submissions are not allowed"
        );
      }

      const created = await tx.assignmentSubmission.create({
        data: {
          assignmentId: input.assignmentId,
          studentId: input.studentId,
          textAnswer: input.textAnswer,
          status: isLate ? "LATE" : "SUBMITTED",
          attemptNumber: existingCount + 1,
          isLate,
          submittedAt: now,
          attachments: input.attachments ? { create: input.attachments } : undefined,
        },
        include: { attachments: true, assignment: true },
      });

      await tx.assignmentAuditLog.create({
        data: {
          assignmentId: input.assignmentId,
          userId: input.studentId,
          action: isLate ? "SUBMITTED_LATE" : "SUBMITTED",
          newValue: { submissionId: created.id, attemptNumber: created.attemptNumber },
        },
      });

      return created;
    },
    { maxWait: 10000, timeout: 15000 }
  );

  // Only auto-queue AI grading for text-based assignments (TEXT/CODE) —
  // FILE_UPLOAD assignments aren't supported by this first grading slice yet.
  if (
    submission.assignment.assignmentType === "TEXT" ||
    submission.assignment.assignmentType === "CODE"
  ) {
    await queueGradingForSubmission(submission.id);
  }
    // Confirm successful submission to the student — matches Task 12's
  // "Submission successful" event, sent regardless of assignment type.
  await createNotification({
    userId: submission.studentId,
    type: "SUBMISSION_SUCCESSFUL",
    title: "Submission received",
    message: `Your submission for "${submission.assignment.title}" was received${
      submission.isLate ? " (marked late)" : ""
    }.`,
    assignmentId: submission.assignmentId,
    submissionId: submission.id,
  });

  if (
    submission.assignment.assignmentType === "TEXT" ||
    submission.assignment.assignmentType === "CODE"
  ) {
    await queueGradingForSubmission(submission.id);
  }


  return submission;
}

export async function listSubmissionsForAssignment(
  assignmentId: string,
  filters?: { status?: SubmissionStatus; page?: number; pageSize?: number }
) {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 10;

  const where: Prisma.AssignmentSubmissionWhereInput = {
    assignmentId,
    ...(filters?.status ? { status: filters.status } : {}),
  };

  const [total, submissions] = await Promise.all([
    prisma.assignmentSubmission.count({ where }),
    prisma.assignmentSubmission.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { attachments: true },
    }),
  ]);

  return {
    submissions,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

export async function getStudentSubmissions(studentId: string) {
  return prisma.assignmentSubmission.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    include: { attachments: true, assignment: true },
  });
}

export async function getSubmissionById(id: string) {
  return prisma.assignmentSubmission.findUnique({
    where: { id },
    include: { attachments: true, assignment: true },
  });
}

export async function requestResubmission(
  submissionId: string,
  teacherId: string,
  reason?: string
) {
  return prisma.$transaction(async (tx) => {
    const submission = await tx.assignmentSubmission.update({
      where: { id: submissionId },
      data: { status: "RESUBMISSION_REQUIRED" },
      include: { assignment: true },
    });

    await tx.assignmentAuditLog.create({
      data: {
        assignmentId: submission.assignmentId,
        userId: teacherId,
        action: "RESUBMISSION_REQUESTED",
        previousValue: { status: "SUBMITTED" },
        newValue: { status: "RESUBMISSION_REQUIRED", reason },
      },
    });

    await tx.notification.create({
      data: {
        userId: submission.studentId,
        type: "RESUBMISSION_REQUESTED",
        title: "Resubmission requested",
        message: `Your teacher requested a resubmission for "${submission.assignment.title}".${
          reason ? ` Reason: ${reason}` : ""
        }`,
        assignmentId: submission.assignmentId,
        submissionId: submission.id,
      },
    });

    return submission;
  });
}