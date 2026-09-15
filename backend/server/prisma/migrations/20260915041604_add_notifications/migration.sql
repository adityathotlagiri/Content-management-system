-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ASSIGNMENT_PUBLISHED', 'DEADLINE_APPROACHING', 'DUE_TODAY', 'OVERDUE', 'SUBMISSION_SUCCESSFUL', 'GRADE_PUBLISHED', 'FEEDBACK_AVAILABLE', 'RESUBMISSION_REQUESTED', 'DEADLINE_EXTENDED');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "assignmentId" TEXT,
    "submissionId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");
