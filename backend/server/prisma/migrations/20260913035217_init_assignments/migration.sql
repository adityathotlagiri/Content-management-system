-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'CLOSED');

-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('TEXT', 'FILE_UPLOAD', 'CODE', 'MIXED');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "instructions" TEXT,
    "courseId" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "assignmentType" "AssignmentType" NOT NULL,
    "difficultyLevel" "DifficultyLevel" NOT NULL,
    "maxMarks" INTEGER NOT NULL,
    "passingMarks" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "submissionDeadline" TIMESTAMP(3) NOT NULL,
    "allowedFileTypes" TEXT[],
    "maxFileSizeMb" INTEGER NOT NULL,
    "allowMultipleFiles" BOOLEAN NOT NULL DEFAULT false,
    "maxSubmissionAttempts" INTEGER NOT NULL DEFAULT 1,
    "lateSubmissionAllowed" BOOLEAN NOT NULL DEFAULT false,
    "latePenaltyPercent" INTEGER,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "clonedFromId" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentAttachment" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssignmentAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentAuditLog" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "previousValue" JSONB,
    "newValue" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssignmentAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Assignment_courseId_idx" ON "Assignment"("courseId");

-- CreateIndex
CREATE INDEX "Assignment_status_idx" ON "Assignment"("status");

-- CreateIndex
CREATE INDEX "Assignment_submissionDeadline_idx" ON "Assignment"("submissionDeadline");

-- CreateIndex
CREATE INDEX "AssignmentAttachment_assignmentId_idx" ON "AssignmentAttachment"("assignmentId");

-- CreateIndex
CREATE INDEX "AssignmentAuditLog_assignmentId_idx" ON "AssignmentAuditLog"("assignmentId");

-- CreateIndex
CREATE INDEX "AssignmentAuditLog_timestamp_idx" ON "AssignmentAuditLog"("timestamp");

-- AddForeignKey
ALTER TABLE "AssignmentAttachment" ADD CONSTRAINT "AssignmentAttachment_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentAuditLog" ADD CONSTRAINT "AssignmentAuditLog_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
