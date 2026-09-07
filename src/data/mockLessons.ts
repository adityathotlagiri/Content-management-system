import type{ Lesson, LessonFormData } from "../types/cms";
import { resolveCourseName } from "./mockCourses";

let lessons: Lesson[] = [
  {
    id: "lesson-1",
    title: "State Management Basics",
    description: "Learn how to manage component state using React hooks.",
    learningObjectives: "Understand useState, when to use it, and common pitfalls.",
    courseId: "course-1",
    courseName: "Modern React Development",
    sequenceOrder: 1,
    status: "Published",
    content: [
      { id: "lc-1", contentType: "video", contentId: "vid-1", title: "Introduction to React Hooks", order: 1 },
      { id: "lc-2", contentType: "document", contentId: "doc-1", title: "React Hooks Cheat Sheet", order: 2 },
      { id: "lc-3", contentType: "quiz", contentId: "quiz-1", title: "React Hooks Fundamentals", order: 3 },
    ],
    createdAt: "2026-08-01T09:00:00Z",
    updatedAt: "2026-08-03T10:00:00Z",
  },
  {
    id: "lesson-2",
    title: "Advanced TypeScript",
    description: "Deep dive into generics, constraints, and utility types.",
    learningObjectives: "Be able to write and read complex generic type signatures.",
    courseId: "course-1",
    courseName: "Modern React Development",
    sequenceOrder: 2,
    status: "Draft",
    content: [
      { id: "lc-4", contentType: "video", contentId: "vid-2", title: "TypeScript Generics Explained", order: 1 },
      { id: "lc-5", contentType: "document", contentId: "doc-2", title: "TypeScript Generics Slides", order: 2 },
    ],
    createdAt: "2026-08-15T14:00:00Z",
    updatedAt: "2026-08-17T13:00:00Z",
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------- READ ----------
export async function fetchLessons(): Promise<Lesson[]> {
  await delay(600);
  return [...lessons].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
}

export async function fetchLessonById(id: string): Promise<Lesson | undefined> {
  await delay(400);
  return lessons.find((l) => l.id === id);
}

// ---------- CREATE ----------
export async function createLesson(data: LessonFormData): Promise<Lesson> {
  await delay(700);

  const newLesson: Lesson = {
    id: `lesson-${Date.now()}`,
    title: data.title,
    description: data.description,
    learningObjectives: data.learningObjectives,
    content: data.content,
    courseId: data.courseId,
    courseName: resolveCourseName(data.courseId),
    status: "Draft",
    sequenceOrder: lessons.length + 1, // appended to the end of the course
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  lessons = [...lessons, newLesson];
  return newLesson;
}

// ---------- UPDATE ----------
export async function updateLesson(id: string, updates: Partial<Lesson>): Promise<Lesson> {
  await delay(500);

  const index = lessons.findIndex((l) => l.id === id);
  if (index === -1) throw new Error("Lesson not found");

  lessons[index] = {
    ...lessons[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return lessons[index];
}

// ---------- DUPLICATE ----------
// Task 12.4 explicitly requires lesson duplication.
export async function duplicateLesson(id: string): Promise<Lesson> {
  await delay(600);

  const original = lessons.find((l) => l.id === id);
  if (!original) throw new Error("Lesson not found");

  const copy: Lesson = {
    ...original,
    id: `lesson-${Date.now()}`,
    title: `${original.title} (Copy)`,
    status: "Draft", // a duplicate always starts as Draft, never inherits Published
    sequenceOrder: lessons.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  lessons = [...lessons, copy];
  return copy;
}

// ---------- DELETE ----------
export async function deleteLesson(id: string): Promise<void> {
  await delay(400);
  lessons = lessons.filter((l) => l.id !== id);
}