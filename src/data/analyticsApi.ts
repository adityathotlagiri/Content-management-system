import type { AssignmentAnalytics } from "../types/homework";

export async function fetchAssignmentAnalytics(assignmentId: string): Promise<AssignmentAnalytics> {
  const res = await fetch(`http://localhost:4000/api/analytics/assignment/${assignmentId}`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}