import type { Feedback } from "../types/homework";

const API_BASE = `${import.meta.env.VITE_API_URL}/api/feedback`;

export async function generateFeedback(submissionId: string): Promise<Feedback> {
  const res = await fetch(`${API_BASE}/${submissionId}/generate`, { method: "POST" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to generate feedback");
  }
  return res.json();
}

export async function fetchFeedback(submissionId: string): Promise<Feedback | null> {
  const res = await fetch(`${API_BASE}/${submissionId}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch feedback");
  return res.json();
}

export async function updateFeedback(
  submissionId: string,
  updates: Partial<Pick<Feedback, "overallComments" | "teacherComments">>
): Promise<Feedback> {
  const res = await fetch(`${API_BASE}/${submissionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update feedback");
  return res.json();
}

export async function approveFeedback(submissionId: string, teacherId: string): Promise<Feedback> {
  const res = await fetch(`${API_BASE}/${submissionId}/approve`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teacherId }),
  });
  if (!res.ok) throw new Error("Failed to approve feedback");
  return res.json();
}

export async function publishFeedback(submissionId: string, teacherId: string): Promise<Feedback> {
  const res = await fetch(`${API_BASE}/${submissionId}/publish`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teacherId }),
  });
  if (!res.ok) throw new Error("Failed to publish feedback");
  return res.json();
}