import type { TeacherDashboardData, DashboardFilters } from "../types/homework";
import type { StudentDashboardData } from "../types/homework";

const API_BASE = `${import.meta.env.VITE_API_URL}/api/dashboard`;

export async function fetchTeacherDashboard(
  teacherId: string,
  filters?: DashboardFilters
): Promise<TeacherDashboardData> {
  const query = new URLSearchParams();
  if (filters?.courseId) query.set("courseId", filters.courseId);
  if (filters?.assignmentId) query.set("assignmentId", filters.assignmentId);
  if (filters?.status) query.set("status", filters.status);
  if (filters?.lateOnly) query.set("lateOnly", "true");
  if (filters?.dateFrom) query.set("dateFrom", filters.dateFrom);
  if (filters?.dateTo) query.set("dateTo", filters.dateTo);

  const res = await fetch(`${API_BASE}/teacher/${teacherId}?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch dashboard data");
  return res.json();
}


export async function fetchStudentDashboard(studentId: string): Promise<StudentDashboardData> {
  const res = await fetch(`${API_BASE}/student/${studentId}`);
  if (!res.ok) throw new Error("Failed to fetch student dashboard");
  return res.json();
}