-- CreateEnum
CREATE TYPE "AIGradingStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'REQUIRES_REVIEW');

-- CreateTable
CREATE TABLE "AIGradingResult" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "status" "AIGradingStatus" NOT NULL DEFAULT 'QUEUED',
    "suggestedScore" DOUBLE PRECISION,
    "confidenceScore" DOUBLE PRECISION,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "missingConcepts" TEXT[],
    "incorrectAnswers" TEXT[],
    "improvementSuggestions" TEXT[],
    "rawModelResponse" JSONB,
    "errorMessage" TEXT,
    "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "teacherApproved" BOOLEAN,
    "finalScore" DOUBLE PRECISION,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "AIGradingResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AIGradingResult_submissionId_key" ON "AIGradingResult"("submissionId");

-- CreateIndex
CREATE INDEX "AIGradingResult_status_idx" ON "AIGradingResult"("status");

-- CreateIndex
CREATE INDEX "AIGradingResult_submissionId_idx" ON "AIGradingResult"("submissionId");

-- AddForeignKey
ALTER TABLE "AIGradingResult" ADD CONSTRAINT "AIGradingResult_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "AssignmentSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
