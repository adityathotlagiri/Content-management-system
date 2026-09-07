import type { CourseOption, CourseLessonOption } from "../types/cms";

const courses: CourseOption[] = [
  { id: "course-1", name: "Modern React Development" },
  { id: "course-2", name: "Backend Engineering with Node.js" },
];

const courseLessons: CourseLessonOption[] = [
  { id: "lesson-1", name: "State Management Basics", courseId: "course-1" },
  { id: "lesson-2", name: "Advanced TypeScript", courseId: "course-1" },
  { id: "lesson-3", name: "REST API Design", courseId: "course-2" },
  { id: "lesson-4", name: "Database Modeling", courseId: "course-2" },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchCourses(): Promise<CourseOption[]> {
  await delay(300);
  return [...courses];
}

export async function fetchCourseLessons(courseId?: string): Promise<CourseLessonOption[]> {
  await delay(300);
  if (!courseId) return [...courseLessons];
  return courseLessons.filter((l) => l.courseId === courseId);
}

export function resolveCourseName(courseId: string): string {
  return courses.find((c) => c.id === courseId)?.name ?? "Unknown Course";
}

export function resolveLessonName(lessonId: string): string {
  return courseLessons.find((l) => l.id === lessonId)?.name ?? "Unknown Lesson";
}