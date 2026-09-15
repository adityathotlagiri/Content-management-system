import { prisma } from "../lib/prisma";
import { Prisma, AssignmentStatus } from "@prisma/client";
import { createNotificationsForUsers } from "./notification.service";
import { getEnrolledStudentIds } from "./enrollment.service";

export interface CreateAssignmentInput {
  title: string;
  description: string;
  instructions?: string;
  courseId: string;
  courseName: string;
  assignmentType: "TEXT" | "FILE_UPLOAD" | "CODE" | "MIXED";
  difficultyLevel: "EASY" | "MEDIUM" | "HARD";
  maxMarks: number;
  passingMarks: number;
  startDate: string;
  submissionDeadline: string;
  allowedFileTypes: string[];
  maxFileSizeMb: number;
  allowMultipleFiles?: boolean;
  maxSubmissionAttempts?: number;
  lateSubmissionAllowed?: boolean;
  latePenaltyPercent?: number;
  createdById: string;
}

export interface ListAssignmentsQuery {
  courseId?: string;
  status?: AssignmentStatus;
  page?: number;
  pageSize?: number;
}

// Every write goes through this helper so no create/update/status-change
// can happen without also leaving an audit trail (Task 15 requirement).
async function writeAuditLog(
  tx: Prisma.TransactionClient,
  assignmentId: string,
  userId: string,
  action: string,
  previousValue?: unknown,
  newValue?: unknown
) {
  await tx.assignmentAuditLog.create({
    data: {
      assignmentId,
      userId,
      action,
      previousValue: previousValue ? (previousValue as Prisma.InputJsonValue) : undefined,
      newValue: newValue ? (newValue as Prisma.InputJsonValue) : undefined,
    },
  });
}

export async function createAssignment(input: CreateAssignmentInput) {
  return prisma.$transaction(
    async (tx) => {
      const assignment = await tx.assignment.create({
        data: {
          title: input.title,
          description: input.description,
          instructions: input.instructions,
          courseId: input.courseId,
          courseName: input.courseName,
          assignmentType: input.assignmentType,
          difficultyLevel: input.difficultyLevel,
          maxMarks: input.maxMarks,
          passingMarks: input.passingMarks,
          startDate: new Date(input.startDate),
          submissionDeadline: new Date(input.submissionDeadline),
          allowedFileTypes: input.allowedFileTypes,
          maxFileSizeMb: input.maxFileSizeMb,
          allowMultipleFiles: input.allowMultipleFiles ?? false,
          maxSubmissionAttempts: input.maxSubmissionAttempts ?? 1,
          lateSubmissionAllowed: input.lateSubmissionAllowed ?? false,
          latePenaltyPercent: input.latePenaltyPercent,
          createdById: input.createdById,
          status: "DRAFT",
        },
      });

      await writeAuditLog(tx, assignment.id, input.createdById, "CREATED", undefined, {
        title: assignment.title,
        status: assignment.status,
      });

      return assignment;
    },
    {
      maxWait: 10000, // wait up to 10s to acquire a transaction slot (was defaulting to ~2s)
      timeout: 15000, // allow up to 15s for the transaction to complete (was defaulting to ~5s)
    }
  );
}

export async function listAssignments(query: ListAssignmentsQuery) {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 10;

  const where: Prisma.AssignmentWhereInput = {
    archivedAt: null, // archived assignments never show in the normal list
    ...(query.courseId ? { courseId: query.courseId } : {}),
    ...(query.status ? { status: query.status } : {}),
  };

  // Run count + page fetch concurrently rather than sequentially —
  // this directly satisfies "Pagination for assignment lists" (Task 18).
  const [total, assignments] = await Promise.all([
    prisma.assignment.count({ where }),
    prisma.assignment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    assignments,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

export async function getAssignmentById(id: string) {
  return prisma.assignment.findUnique({
    where: { id },
    include: {
      attachments: true,
      auditLogs: { orderBy: { timestamp: "desc" }, take: 20 },
    },
  });
}

export async function updateAssignmentStatus(
  id: string,
  newStatus: AssignmentStatus,
  userId: string
) {
  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.assignment.findUnique({ where: { id } });
    if (!existing) throw new Error("Assignment not found");

    const updated = await tx.assignment.update({
      where: { id },
      data: { status: newStatus },
    });

    await writeAuditLog(
      tx,
      id,
      userId,
      "STATUS_CHANGED",
      { status: existing.status },
      { status: newStatus }
    );

    return updated;
  });

  // Notify enrolled students when an assignment goes live —
  // outside the transaction since it's a side effect, not part of the
  // atomic status-change itself.
  if (newStatus === "PUBLISHED") {
    const studentIds = await getEnrolledStudentIds(result.courseId);
    await createNotificationsForUsers(studentIds, {
      type: "ASSIGNMENT_PUBLISHED",
      title: "New assignment published",
      message: `"${result.title}" is now available. Due ${result.submissionDeadline.toLocaleDateString()}.`,
      assignmentId: result.id,
    });
  }

  return result;
}
export async function duplicateAssignment(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const original = await tx.assignment.findUnique({ where: { id } });
    if (!original) {
      throw new Error("Assignment not found");
    }

    const clone = await tx.assignment.create({
      data: {
        title: `${original.title} (Copy)`,
        description: original.description,
        instructions: original.instructions,
        courseId: original.courseId,
        courseName: original.courseName,
        assignmentType: original.assignmentType,
        difficultyLevel: original.difficultyLevel,
        maxMarks: original.maxMarks,
        passingMarks: original.passingMarks,
        startDate: original.startDate,
        submissionDeadline: original.submissionDeadline,
        allowedFileTypes: original.allowedFileTypes,
        maxFileSizeMb: original.maxFileSizeMb,
        allowMultipleFiles: original.allowMultipleFiles,
        maxSubmissionAttempts: original.maxSubmissionAttempts,
        lateSubmissionAllowed: original.lateSubmissionAllowed,
        latePenaltyPercent: original.latePenaltyPercent,
        createdById: userId,
        status: "DRAFT", // a duplicate never inherits Published/Scheduled status
        clonedFromId: original.id,
        version: 1,
      },
    });

    await writeAuditLog(tx, clone.id, userId, "DUPLICATED", undefined, {
      clonedFromId: original.id,
    });

    return clone;
  });
}

export async function archiveAssignment(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.assignment.update({
      where: { id },
      data: { archivedAt: new Date() },
    });

    await writeAuditLog(tx, id, userId, "ARCHIVED");

    return updated;
  });
}