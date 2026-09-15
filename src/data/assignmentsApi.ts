import  type {
  Assignment,
  AssignmentFormData,
  AssignmentListResponse,
  AssignmentStatus,
} from "../types/homework";

// Base URL for the real Express backend — swap this for an env var
// once you have separate dev/staging/production API URLs.
const API_BASE = "http://localhost:4000/api/assignments";

// Same function names/shapes as your CMS mock-data files
// (fetchVideos, createVideo, etc.) so hooks barely change even though
// these now call a real backend instead of an in-memory array.

export async function fetchAssignments(params?: {
  courseId?: string;
  status?: AssignmentStatus;
  page?: number;
  pageSize?: number;
}): Promise<AssignmentListResponse> {
  const query = new URLSearchParams();
  if (params?.courseId) query.set("courseId", params.courseId);
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));

  const res = await fetch(`${API_BASE}?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch assignments");
  return res.json();
}

export async function fetchAssignmentById(id: string): Promise<Assignment> {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error("Assignment not found");
  return res.json();
}

export async function createAssignment(
  data: AssignmentFormData,
  createdById: string
): Promise<Assignment> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, createdById }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to create assignment");
  }
  return res.json();
}

export async function updateAssignmentStatus(
  id: string,
  status: AssignmentStatus,
  userId: string
): Promise<Assignment> {
  const res = await fetch(`${API_BASE}/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, userId }),
  });
  if (!res.ok) throw new Error("Failed to update assignment status");
  return res.json();
}

export async function duplicateAssignment(id: string, userId: string): Promise<Assignment> {
  const res = await fetch(`${API_BASE}/${id}/duplicate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error("Failed to duplicate assignment");
  return res.json();
}

export async function archiveAssignment(id: string, userId: string): Promise<Assignment> {
  const res = await fetch(`${API_BASE}/${id}/archive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error("Failed to archive assignment");
  return res.json();
}