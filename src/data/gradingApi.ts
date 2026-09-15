import type  { AIGradingResult } from "../types/homework";

const API_BASE = "http://localhost:4000/api/grading";

export async function fetchGradingResultBySubmission(
  submissionId: string
): Promise<AIGradingResult | null> {
  const res = await fetch(`${API_BASE}/submission/${submissionId}`);
  if (res.status === 404) return null; // grading not queued/not started yet
  if (!res.ok) throw new Error("Failed to fetch grading result");
  return res.json();
}