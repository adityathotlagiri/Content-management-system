// src/types/cms.ts

// Shared status types used across videos, documents, quizzes, lessons
export type ContentStatus = "Draft" | "Processing" | "Published" | "Failed";
export type DocumentStatus = "Draft" | "Published";
export type QuizStatus = "Draft" | "Published" | "Unpublished";
export type LessonStatus = "Draft" | "Published";

// ---------- Video ----------
export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  fileUrl: string;
  fileName: string;
  fileSize: number; // in bytes
  duration?: number; // in seconds, set after "processing"
  courseId: string;
  courseName: string;
  lessonId: string;
  lessonName: string;
  status: ContentStatus;
  uploadProgress?: number; // 0–100, only relevant while uploading
  errorMessage?: string; // populated when status === "Failed"
  createdAt: string;
  updatedAt: string;
}

// Shape of the form used to create/edit a video
export interface VideoFormData {
  title: string;
  description: string;
  courseId: string;
  lessonId: string;
  file: File | null;
  thumbnail: File | null;
}

// Supported video formats (used in validation)
export const SUPPORTED_VIDEO_FORMATS = [
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov
];
// --- Append to src/types/cms.ts ---

// ---------- Document ----------
export interface Document {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileType: string; // e.g. "application/pdf"
  fileSize: number; // in bytes
  courseId: string;
  courseName: string;
  lessonId: string;
  lessonName: string;
  status: DocumentStatus;
  uploadProgress?: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentFormData {
  title: string;
  description: string;
  courseId: string;
  lessonId: string;
  file: File | null;
}

export const SUPPORTED_DOCUMENT_FORMATS = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/msword", // .doc
];
// --- Append to src/types/cms.ts ---

// ---------- Quiz ----------
export interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: AnswerOption[];
  marks: number;
  order: number; // controls display/answer order within the quiz
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  lessonId: string;
  lessonName: string;
  questions: QuizQuestion[];
  durationMinutes?: number; // optional per requirements ("where required")
  passingScore: number; // percentage, e.g. 60
  status: QuizStatus;
  createdAt: string;
  updatedAt: string;
}

// Shape used while building/editing a quiz in the form —
// same as Quiz, minus server-generated fields.
export interface QuizFormData {
  title: string;
  description: string;
  courseId: string;
  lessonId: string;
  questions: QuizQuestion[];
  durationMinutes?: number;
  passingScore: number;
}

// Helper for creating a new blank question in the builder UI
export function createEmptyQuestion(order: number): QuizQuestion {
  return {
    id: `q-${Date.now()}-${order}`,
    text: "",
    marks: 1,
    order,
    options: [
      { id: `opt-${Date.now()}-1`, text: "", isCorrect: false },
      { id: `opt-${Date.now()}-2`, text: "", isCorrect: false },
    ],
  };
}
// --- Append to src/types/cms.ts ---

// ---------- Lesson ----------
export type LessonContentType = "video" | "document" | "quiz";

// A single attached content item, in lesson-defined order.
// Stores just enough to render a row in the lesson builder without
// re-fetching the full Video/Document/Quiz record every time.
export interface LessonContentItem {
  id: string; // unique within this lesson's content list
  contentType: LessonContentType;
  contentId: string; // the actual Video/Document/Quiz id
  title: string; // denormalized for display, avoids extra lookups
  order: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  learningObjectives: string;
  courseId: string;
  courseName: string;
  content: LessonContentItem[];
  status: LessonStatus;
  sequenceOrder: number; // position of this lesson within the course
  createdAt: string;
  updatedAt: string;
}

export interface LessonFormData {
  title: string;
  description: string;
  learningObjectives: string;
  courseId: string;
  content: LessonContentItem[];
}
// --- Append to src/types/cms.ts ---

// ---------- Unified CMS content (Task 12.5) ----------
export type CMSContentType = "video" | "document" | "quiz" | "lesson";
export type CMSContentStatus = ContentStatus | QuizStatus | LessonStatus; // union of all possible statuses

// A single normalized row for the centralized content list —
// flattens Video/Document/Quiz/Lesson into one common shape so
// they can be displayed, searched, filtered, and sorted together.
export interface CMSContentItem {
  id: string;
  contentType: CMSContentType;
  title: string;
  courseName: string;
  lessonName?: string; // videos/documents/quizzes have this; lessons don't
  status: CMSContentStatus;
  updatedAt: string;
}

// ---------- Courses (for dropdowns across all upload/builder forms) ----------
export interface CourseOption {
  id: string;
  name: string;
}

export interface CourseLessonOption {
  id: string;
  name: string;
  courseId: string;
}

export type SortField = "title" | "updatedAt" | "status";
export type SortDirection = "asc" | "desc";
export const MAX_DOCUMENT_SIZE_MB = 50;
export const MAX_VIDEO_SIZE_MB = 500;