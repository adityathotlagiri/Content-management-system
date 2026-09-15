import { prisma } from "../lib/prisma";

export async function enrollStudent(studentId: string, courseId: string, courseName: string) {
  // Upsert so re-enrolling (e.g. duplicate request) doesn't error —
  // it's idempotent by design given the @@unique constraint.
  return prisma.enrollment.upsert({
    where: { studentId_courseId: { studentId, courseId } },
    update: {},
    create: { studentId, courseId, courseName },
  });
}

export async function getEnrolledCourseIds(studentId: string): Promise<string[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    select: { courseId: true },
  });
  return enrollments.map((e) => e.courseId);
}

export async function getEnrolledStudentIds(courseId: string): Promise<string[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    select: { studentId: true },
  });
  return enrollments.map((e) => e.studentId);
}

export async function listEnrollmentsForCourse(courseId: string) {
  return prisma.enrollment.findMany({ where: { courseId }, orderBy: { enrolledAt: "asc" } });
}