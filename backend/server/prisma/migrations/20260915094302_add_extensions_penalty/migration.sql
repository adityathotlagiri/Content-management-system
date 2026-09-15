-- AlterTable
ALTER TABLE "AssignmentSubmission" ADD COLUMN     "latePenaltyApplied" DOUBLE PRECISION,
ADD COLUMN     "penaltyWaived" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "DeadlineExtension" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT,
    "oldDeadline" TIMESTAMP(3) NOT NULL,
    "newDeadline" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "grantedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeadlineExtension_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeadlineExtension_assignmentId_idx" ON "DeadlineExtension"("assignmentId");

-- AddForeignKey
ALTER TABLE "DeadlineExtension" ADD CONSTRAINT "DeadlineExtension_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
