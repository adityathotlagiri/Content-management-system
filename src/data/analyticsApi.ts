import type { AssignmentAnalytics } from "../types/homework";

export async function fetchAssignmentAnalytics(assignmentId: string): Promise<AssignmentAnalytics> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/analytics/assignment/${assignmentId}`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}