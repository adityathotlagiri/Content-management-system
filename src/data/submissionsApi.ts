import type { AssignmentSubmission } from "../types/homework";
import type { SubmissionStatus } from "../types/homework";

const API_BASE = `${import.meta.env.VITE_API_URL}/api/submissions`;

export interface SubmitAssignmentPayload {
  assignmentId: string;
  studentId: string;
  textAnswer?: string;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSizeBytes: number;
  }[];
}

export async function submitAssignment(payload: SubmitAssignmentPayload): Promise<AssignmentSubmission> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to submit assignment");
  }
  return res.json();
}

export async function fetchStudentSubmissions(studentId: string): Promise<AssignmentSubmission[]> {
  const res = await fetch(`${API_BASE}/student/${studentId}`);
  if (!res.ok) throw new Error("Failed to fetch submissions");
  return res.json();
}

export interface SubmissionListResponse {
  submissions: AssignmentSubmission[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

export async function fetchSubmissionsForAssignment(
  assignmentId: string,
  params?: { status?: SubmissionStatus; page?: number; pageSize?: number }
): Promise<SubmissionListResponse> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));

  const res = await fetch(`${API_BASE}/assignment/${assignmentId}?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch submissions");
  return res.json();
}

export async function requestResubmission(
  submissionId: string,
  teacherId: string,
  reason?: string
): Promise<AssignmentSubmission> {
  const res = await fetch(`${API_BASE}/${submissionId}/request-resubmission`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teacherId, reason }),
  });
  if (!res.ok) throw new Error("Failed to request resubmission");
  return res.json();
}


export interface FinalizeGradeInput {
  finalScore: number;
  teacherApproved: boolean;
  reviewedById: string;
  teacherComment?: string;
}

export async function finalizeGrade(
  submissionId: string,
  input: FinalizeGradeInput
): Promise<AssignmentSubmission> {
  const res = await fetch(`${API_BASE}/${submissionId}/finalize-grade`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to finalize grade");
  return res.json();
}
export async function fetchSubmissionById(id: string): Promise<AssignmentSubmission> {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error("Submission not found");
  return res.json();
}