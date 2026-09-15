import { prisma } from "../lib/prisma";

export async function calculateLatePenalty(submissionId: string) {
  const submission = await prisma.assignmentSubmission.findUnique({
    where: { id: submissionId },
    include: { assignment: true, aiGradingResult: true },
  });
  if (!submission) throw new Error("Submission not found");
  if (!submission.isLate || submission.penaltyWaived) return submission;
  if (!submission.assignment.latePenaltyPercent) return submission;

  const hoursLate = Math.ceil(
    (submission.submittedAt!.getTime() - submission.assignment.submissionDeadline.getTime()) / (1000 * 60 * 60)
  );
  const penaltyPercent = Math.min(100, submission.assignment.latePenaltyPercent * Math.ceil(hoursLate / 24));

  return prisma.assignmentSubmission.update({
    where: { id: submissionId },
    data: { latePenaltyApplied: penaltyPercent },
  });
}

export async function waivePenalty(submissionId: string, teacherId: string) {
  const submission = await prisma.assignmentSubmission.update({
    where: { id: submissionId },
    data: { penaltyWaived: true, latePenaltyApplied: null },
  });

  await prisma.assignmentAuditLog.create({
    data: {
      assignmentId: submission.assignmentId,
      userId: teacherId,
      action: "LATE_PENALTY_WAIVED",
      newValue: { submissionId },
    },
  });

  return submission;
}

export async function grantExtension(input: {
  assignmentId: string;
  studentId?: string;
  newDeadline: string;
  reason?: string;
  grantedById: string;
}) {
  return prisma.$transaction(async (tx) => {
    const assignment = await tx.assignment.findUnique({ where: { id: input.assignmentId } });
    if (!assignment) throw new Error("Assignment not found");

    const extension = await tx.deadlineExtension.create({
      data: {
        assignmentId: input.assignmentId,
        studentId: input.studentId,
        oldDeadline: assignment.submissionDeadline,
        newDeadline: new Date(input.newDeadline),
        reason: input.reason,
        grantedById: input.grantedById,
      },
    });

    // Whole-assignment extension updates the assignment itself;
    // per-student extension leaves assignment deadline as-is (handled
    // at submission-check time by looking up extensions — not built
    // here to keep scope contained; whole-assignment path only).
    if (!input.studentId) {
      await tx.assignment.update({
        where: { id: input.assignmentId },
        data: { submissionDeadline: new Date(input.newDeadline) },
      });

      await tx.assignmentAuditLog.create({
        data: {
          assignmentId: input.assignmentId,
          userId: input.grantedById,
          action: "DEADLINE_EXTENDED",
          previousValue: { deadline: assignment.submissionDeadline },
          newValue: { deadline: input.newDeadline },
        },
      });

      await tx.notification.createMany({
        data: [], // enrolled-student bulk notify handled by caller (avoids circular import here)
      });
    }

    return extension;
  });
}

export async function acceptLateSubmission(submissionId: string) {
  return prisma.assignmentSubmission.update({
    where: { id: submissionId },
    data: { status: "SUBMITTED" },
  });
}

export async function rejectLateSubmission(submissionId: string, teacherId: string) {
  const submission = await prisma.assignmentSubmission.update({
    where: { id: submissionId },
    data: { status: "RESUBMISSION_REQUIRED" },
  });

  await prisma.assignmentAuditLog.create({
    data: {
      assignmentId: submission.assignmentId,
      userId: teacherId,
      action: "LATE_SUBMISSION_REJECTED",
      newValue: { submissionId },
    },
  });

  return submission;
}