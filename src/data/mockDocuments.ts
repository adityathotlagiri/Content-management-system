import type{ Document, DocumentFormData } from "../types/cms";
import { resolveCourseName, resolveLessonName } from "./mockCourses";

let documents: Document[] = [
  {
    id: "doc-1",
    title: "React Hooks Cheat Sheet",
    description: "Quick reference for useState, useEffect, and custom hooks.",
    fileUrl: "https://example.com/docs/react-hooks-cheatsheet.pdf",
    fileName: "react-hooks-cheatsheet.pdf",
    fileType: "application/pdf",
    fileSize: 1258291, // ~1.2MB
    courseId: "course-1",
    courseName: "Modern React Development",
    lessonId: "lesson-1",
    lessonName: "State Management Basics",
    status: "Published",
    createdAt: "2026-08-02T09:00:00Z",
    updatedAt: "2026-08-02T09:00:00Z",
  },
  {
    id: "doc-2",
    title: "TypeScript Generics Slides",
    description: "Slide deck covering generic types, constraints, and utility types.",
    fileUrl: "https://example.com/docs/ts-generics.pptx",
    fileName: "ts-generics-slides.pptx",
    fileType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    fileSize: 3145728, // 3MB
    courseId: "course-1",
    courseName: "Modern React Development",
    lessonId: "lesson-2",
    lessonName: "Advanced TypeScript",
    status: "Draft",
    createdAt: "2026-08-16T11:15:00Z",
    updatedAt: "2026-08-16T11:15:00Z",
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------- READ ----------
export async function fetchDocuments(): Promise<Document[]> {
  await delay(600);
  return [...documents];
}

export async function fetchDocumentById(id: string): Promise<Document | undefined> {
  await delay(400);
  return documents.find((d) => d.id === id);
}

// ---------- CREATE ----------
export async function createDocument(data: DocumentFormData): Promise<Document> {
  await delay(800);

  const newDocument: Document = {
    id: `doc-${Date.now()}`,
    title: data.title,
    description: data.description,
    fileUrl: data.file ? URL.createObjectURL(data.file) : "",
    fileName: data.file?.name ?? "unknown-file",
    fileType: data.file?.type ?? "application/octet-stream",
    fileSize: data.file?.size ?? 0,
    status: "Draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    courseId: data.courseId,
    courseName: resolveCourseName(data.courseId),
    lessonId: data.lessonId,
    lessonName: resolveLessonName(data.lessonId),
  };

  documents = [newDocument, ...documents];
  return newDocument;
}

// ---------- UPDATE ----------
export async function updateDocument(
  id: string,
  updates: Partial<Document>
): Promise<Document> {
  await delay(500);

  const index = documents.findIndex((d) => d.id === id);
  if (index === -1) throw new Error("Document not found");

  documents[index] = {
    ...documents[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return documents[index];
}

// ---------- DELETE ----------
export async function deleteDocument(id: string): Promise<void> {
  await delay(400);
  documents = documents.filter((d) => d.id !== id);
}