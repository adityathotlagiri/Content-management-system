import type { AssignmentRubric, RubricCriterion } from "../types/homework";
import type { RubricEvaluation } from "../types/homework";

const API_BASE = "http://localhost:4000/api/rubrics";

export interface CreateRubricPayload {
  title: string;
  description?: string;
  createdById: string;
  criteria: Omit<RubricCriterion, "id">[];
}
export async function fetchRubricEvaluations(gradingResultId: string): Promise<RubricEvaluation[]> {
  const res = await fetch(`http://localhost:4000/api/grading/${gradingResultId}/rubric-evaluations`);
  if (!res.ok) return [];
  return res.json();
}

export interface OverrideCriterionInput {
  gradingResultId: string;
  criterionId: string;
  teacherScore: number;
}

export async function overrideCriterionScore(input: OverrideCriterionInput): Promise<RubricEvaluation> {
  const res = await fetch(`http://localhost:4000/api/grading/rubric-evaluation/override`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to override criterion score");
  return res.json();
}
export async function createRubric(payload: CreateRubricPayload): Promise<AssignmentRubric> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to create rubric");
  }
  return res.json();
}

export async function fetchRubrics(createdById: string): Promise<AssignmentRubric[]> {
  const res = await fetch(`${API_BASE}/creator/${createdById}`);
  if (!res.ok) throw new Error("Failed to fetch rubrics");
  return res.json();
}

export async function attachRubricToAssignment(
  assignmentId: string,
  rubricId: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/assignment/${assignmentId}/attach`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rubricId }),
  });
  if (!res.ok) throw new Error("Failed to attach rubric");
}