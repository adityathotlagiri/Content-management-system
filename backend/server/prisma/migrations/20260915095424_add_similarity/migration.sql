-- CreateTable
CREATE TABLE "SimilarityFlag" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "submissionAId" TEXT NOT NULL,
    "submissionBId" TEXT NOT NULL,
    "similarityPercent" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SimilarityFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SimilarityFlag_assignmentId_idx" ON "SimilarityFlag"("assignmentId");
