import { prisma } from "../lib/prisma";
import { createNotificationsForUsers, createNotification } from "../services/notification.service";
import { getEnrolledStudentIds } from "../services/enrollment.service";

const CHECK_INTERVAL_MS = 15 * 60 * 1000; // every 15 minutes — reminders don't need minute-level precision

// Tracks which (assignmentId, reminderType) pairs have already been sent
// this run, so a restart doesn't immediately re-send everything — backed
// by checking for an existing Notification row of that type, not just
// in-memory state (which would reset on every server restart anyway).
async function alreadyNotified(assignmentId: string, type: "DEADLINE_APPROACHING" | "DUE_TODAY" | "OVERDUE"): Promise<Set<string>> {
  const existing = await prisma.notification.findMany({
    where: { assignmentId, type },
    select: { userId: true },
  });
  return new Set(existing.map((n) => n.userId));
}

async function checkDeadlines() {
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const publishedAssignments = await prisma.assignment.findMany({
    where: { status: "PUBLISHED", archivedAt: null },
  });

  for (const assignment of publishedAssignments) {
    const deadline = assignment.submissionDeadline;
    const enrolledStudentIds = await getEnrolledStudentIds(assignment.courseId);

    // Find students who've already submitted — they don't need reminders.
    const submitted = await prisma.assignmentSubmission.findMany({
      where: { assignmentId: assignment.id },
      select: { studentId: true },
      distinct: ["studentId"],
    });
    const submittedSet = new Set(submitted.map((s) => s.studentId));
    const pendingStudentIds = enrolledStudentIds.filter((id) => !submittedSet.has(id));

    if (pendingStudentIds.length === 0) continue;

    const isSameDay =
      deadline.getFullYear() === now.getFullYear() &&
      deadline.getMonth() === now.getMonth() &&
      deadline.getDate() === now.getDate();

    if (deadline <= now) {
      // Overdue — send once per student, only if not already sent.
      const alreadySent = await alreadyNotified(assignment.id, "OVERDUE");
      const toNotify = pendingStudentIds.filter((id) => !alreadySent.has(id));
      await createNotificationsForUsers(toNotify, {
        type: "OVERDUE",
        title: "Assignment overdue",
        message: `"${assignment.title}" is now overdue.`,
        assignmentId: assignment.id,
      });
    } else if (isSameDay) {
      const alreadySent = await alreadyNotified(assignment.id, "DUE_TODAY");
      const toNotify = pendingStudentIds.filter((id) => !alreadySent.has(id));
      await createNotificationsForUsers(toNotify, {
        type: "DUE_TODAY",
        title: "Assignment due today",
        message: `"${assignment.title}" is due today.`,
        assignmentId: assignment.id,
      });
    } else if (deadline <= in24Hours) {
      const alreadySent = await alreadyNotified(assignment.id, "DEADLINE_APPROACHING");
      const toNotify = pendingStudentIds.filter((id) => !alreadySent.has(id));
      await createNotificationsForUsers(toNotify, {
        type: "DEADLINE_APPROACHING",
        title: "Deadline approaching",
        message: `"${assignment.title}" is due within 24 hours.`,
        assignmentId: assignment.id,
      });
    }
  }
}

export function startDeadlineReminderWorker() {
  console.log("[deadline-reminders] Worker started, checking every", CHECK_INTERVAL_MS / 60000, "minutes");
  setInterval(checkDeadlines, CHECK_INTERVAL_MS);
}