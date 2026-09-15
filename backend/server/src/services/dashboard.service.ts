/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { getEnrolledCourseIds, getEnrolledStudentIds } from "./enrollment.service";

export interface DashboardFilters {
  courseId?: string;
  assignmentId?: string;
  status?: string;
  lateOnly?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export async function getTeacherGradingDashboard(teacherId: string, filters?: DashboardFilters) {
  // Only look at assignments this teacher created — Task 17:
  // "Teachers can access only authorized courses and assignments."
  const assignmentWhere: Prisma.AssignmentWhereInput = {
    createdById: teacherId,
    archivedAt: null,
    ...(filters?.courseId ? { courseId: filters.courseId } : {}),
  };

  const assignments = await prisma.assignment.findMany({
    where: assignmentWhere,
    select: { id: true, courseId: true, submissionDeadline: true },
  });
  const assignmentIds = assignments.map((a) => a.id);

  const submissionWhere: Prisma.AssignmentSubmissionWhereInput = {
    assignmentId: filters?.assignmentId ? filters.assignmentId : { in: assignmentIds },
    ...(filters?.status ? { status: filters.status as any } : {}),
    ...(filters?.lateOnly ? { isLate: true } : {}),
    ...(filters?.dateFrom || filters?.dateTo
      ? {
          submittedAt: {
            ...(filters?.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
            ...(filters?.dateTo ? { lte: new Date(filters.dateTo) } : {}),
          },
        }
      : {}),
  };

  const [
    totalAssignments,
    pendingGrading,
    aiGradedCount,
    teacherReviewedCount,
    lateSubmissionsCount,
    gradedResults,
  ] = await Promise.all([
    prisma.assignment.count({ where: assignmentWhere }),

    // "Pending grading" = submitted but not yet finalized by a teacher
    prisma.assignmentSubmission.count({
      where: { ...submissionWhere, status: { in: ["SUBMITTED", "LATE", "UNDER_REVIEW"] } },
    }),

    prisma.aIGradingResult.count({
      where: {
        submission: { assignmentId: { in: assignmentIds } },
        status: { in: ["COMPLETED", "REQUIRES_REVIEW"] },
      },
    }),

    prisma.aIGradingResult.count({
      where: {
        submission: { assignmentId: { in: assignmentIds } },
        teacherApproved: { not: null },
      },
    }),

    prisma.assignmentSubmission.count({
      where: { ...submissionWhere, isLate: true },
    }),

    // Fetch final scores to compute average — small enough result set
    // that computing in JS is simpler than a raw SQL AVG() here.
    prisma.aIGradingResult.findMany({
      where: {
        submission: { assignmentId: { in: assignmentIds } },
        finalScore: { not: null },
      },
      select: { finalScore: true },
    }),
  ]);

  const averageScore =
    gradedResults.length > 0
      ? gradedResults.reduce((sum, r) => sum + (r.finalScore ?? 0), 0) / gradedResults.length
      : null;

  // Missing submissions: for each assignment past its deadline, count
  // enrolled students who never submitted. Only counted once the
  // deadline has passed — before that, a student just hasn't
  // submitted YET, which isn't the same as missing.
  let missingSubmissions = 0;
  for (const assignment of assignments) {
    if (assignment.submissionDeadline > new Date()) continue;

    const enrolledStudentIds = await getEnrolledStudentIds(assignment.courseId);
    const submittedStudentIds = await prisma.assignmentSubmission.findMany({
      where: { assignmentId: assignment.id },
      select: { studentId: true },
      distinct: ["studentId"],
    });
    const submittedSet = new Set(submittedStudentIds.map((s) => s.studentId));

    missingSubmissions += enrolledStudentIds.filter((id) => !submittedSet.has(id)).length;
  }

  // "Students requiring attention" = students with a LATE or
  // RESUBMISSION_REQUIRED status, or a low AI confidence score needing review.
  const attentionSubmissions = await prisma.assignmentSubmission.findMany({
    where: {
      assignmentId: { in: assignmentIds },
      OR: [
        { status: "RESUBMISSION_REQUIRED" },
        { status: "LATE" },
        { aiGradingResult: { status: "REQUIRES_REVIEW" } },
      ],
    },
    select: { id: true, studentId: true, status: true, assignmentId: true },
    take: 20,
  });

  return {
    totalAssignments,
    pendingGrading,
    aiGradedCount,
    teacherReviewedCount,
    averageScore,
    lateSubmissionsCount,
    missingSubmissions,
    studentsRequiringAttention: attentionSubmissions,
  };
}

export async function getStudentDashboard(studentId: string) {
  const now = new Date();

  const enrolledCourseIds = await getEnrolledCourseIds(studentId);

  // Scoped to courses this student is actually enrolled in.
  const publishedAssignments = await prisma.assignment.findMany({
    where: {
      status: "PUBLISHED",
      archivedAt: null,
      courseId: { in: enrolledCourseIds },
    },
    orderBy: { submissionDeadline: "asc" },
  });

  const studentSubmissions = await prisma.assignmentSubmission.findMany({
    where: { studentId },
    include: { assignment: true, aiGradingResult: true },
  });

  const submittedAssignmentIds = new Set(studentSubmissions.map((s) => s.assignmentId));

  const upcoming = publishedAssignments.filter(
    (a) => !submittedAssignmentIds.has(a.id) && a.submissionDeadline > now
  );

  const dueToday = upcoming.filter((a) => {
    const deadline = new Date(a.submissionDeadline);
    return (
      deadline.getFullYear() === now.getFullYear() &&
      deadline.getMonth() === now.getMonth() &&
      deadline.getDate() === now.getDate()
    );
  });

  const overdue = publishedAssignments.filter(
    (a) => !submittedAssignmentIds.has(a.id) && a.submissionDeadline <= now
  );

  const submitted = studentSubmissions.filter(
    (s) => s.status === "SUBMITTED" || s.status === "LATE" || s.status === "UNDER_REVIEW"
  );

  const graded = studentSubmissions.filter((s) => s.status === "GRADED");

  const pendingFeedback = studentSubmissions.filter(
    (s) => s.status === "UNDER_REVIEW" && s.aiGradingResult?.status === "COMPLETED"
  );

  const gradedScores = graded
    .map((s) => s.aiGradingResult?.finalScore)
    .filter((score): score is number => score != null);

  const averageScore =
    gradedScores.length > 0
      ? gradedScores.reduce((sum, s) => sum + s, 0) / gradedScores.length
      : null;

  return {
    upcoming,
    dueToday,
    overdue,
    submitted: submitted.map((s) => s.assignment),
    graded: graded.map((s) => ({ assignment: s.assignment, finalScore: s.aiGradingResult?.finalScore })),
    pendingFeedbackCount: pendingFeedback.length,
    averageScore,
  };
}