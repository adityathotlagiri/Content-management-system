// server/src/services/rubric.service.ts
import { prisma } from "../lib/prisma";

export interface RubricCriterionInput {
  title: string;
  description?: string;
  weightage: number;
  maxMarks: number;
  order: number;
}

export interface CreateRubricInput {
  title: string;
  description?: string;
  createdById: string;
  criteria: RubricCriterionInput[];
}

function validateWeightage(criteria: RubricCriterionInput[]): void {
  const total = criteria.reduce((sum, c) => sum + c.weightage, 0);
  if (Math.abs(total - 100) > 0.01) {
    throw new Error(`Criterion weightages must sum to 100 (currently ${total})`);
  }
}

export async function createRubric(input: CreateRubricInput) {
  validateWeightage(input.criteria);

  return prisma.assignmentRubric.create({
    data: {
      title: input.title,
      description: input.description,
      createdById: input.createdById,
      criteria: { create: input.criteria },
    },
    include: { criteria: { orderBy: { order: "asc" } } },
  });
}

export async function listRubrics(createdById: string) {
  return prisma.assignmentRubric.findMany({
    where: { createdById },
    include: { criteria: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRubricById(id: string) {
  return prisma.assignmentRubric.findUnique({
    where: { id },
    include: { criteria: { orderBy: { order: "asc" } } },
  });
}

export async function attachRubricToAssignment(assignmentId: string, rubricId: string) {
  return prisma.assignment.update({
    where: { id: assignmentId },
    data: { rubricId },
  });
}