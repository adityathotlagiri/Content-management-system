-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('DRAFT', 'APPROVED', 'PUBLISHED');

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "overallComments" TEXT NOT NULL,
    "whatWentWell" TEXT[],
    "areasForImprovement" TEXT[],
    "specificMistakes" TEXT[],
    "recommendedNextSteps" TEXT[],
    "suggestedResources" TEXT[],
    "teacherComments" TEXT,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'DRAFT',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "regeneratedCount" INTEGER NOT NULL DEFAULT 0,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_submissionId_key" ON "Feedback"("submissionId");

-- CreateIndex
CREATE INDEX "Feedback_submissionId_idx" ON "Feedback"("submissionId");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "AssignmentSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
