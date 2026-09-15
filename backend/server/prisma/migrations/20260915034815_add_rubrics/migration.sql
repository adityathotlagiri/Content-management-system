-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "rubricId" TEXT;

-- CreateTable
CREATE TABLE "AssignmentRubric" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssignmentRubric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubricCriterion" (
    "id" TEXT NOT NULL,
    "rubricId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "weightage" INTEGER NOT NULL,
    "maxMarks" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "RubricCriterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubricEvaluation" (
    "id" TEXT NOT NULL,
    "gradingResultId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "aiScore" DOUBLE PRECISION NOT NULL,
    "aiReasoning" TEXT NOT NULL,
    "teacherScore" DOUBLE PRECISION,
    "teacherOverridden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RubricEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssignmentRubric_createdById_idx" ON "AssignmentRubric"("createdById");

-- CreateIndex
CREATE INDEX "RubricCriterion_rubricId_idx" ON "RubricCriterion"("rubricId");

-- CreateIndex
CREATE INDEX "RubricEvaluation_gradingResultId_idx" ON "RubricEvaluation"("gradingResultId");

-- CreateIndex
CREATE UNIQUE INDEX "RubricEvaluation_gradingResultId_criterionId_key" ON "RubricEvaluation"("gradingResultId", "criterionId");

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "AssignmentRubric"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricCriterion" ADD CONSTRAINT "RubricCriterion_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "AssignmentRubric"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricEvaluation" ADD CONSTRAINT "RubricEvaluation_gradingResultId_fkey" FOREIGN KEY ("gradingResultId") REFERENCES "AIGradingResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricEvaluation" ADD CONSTRAINT "RubricEvaluation_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "RubricCriterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
