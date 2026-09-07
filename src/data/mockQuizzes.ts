import type{ Quiz, QuizFormData } from "../types/cms";
import { resolveCourseName, resolveLessonName } from "./mockCourses";

let quizzes: Quiz[] = [
  {
    id: "quiz-1",
    title: "React Hooks Fundamentals",
    description: "Test your understanding of useState and useEffect.",
    courseId: "course-1",
    courseName: "Modern React Development",
    lessonId: "lesson-1",
    lessonName: "State Management Basics",
    durationMinutes: 15,
    passingScore: 60,
    status: "Published",
    questions: [
      {
        id: "q-1",
        text: "Which hook is used to manage state in a functional component?",
        marks: 2,
        order: 1,
        options: [
          { id: "opt-1", text: "useEffect", isCorrect: false },
          { id: "opt-2", text: "useState", isCorrect: true },
          { id: "opt-3", text: "useRef", isCorrect: false },
          { id: "opt-4", text: "useMemo", isCorrect: false },
        ],
      },
      {
        id: "q-2",
        text: "When does useEffect run by default?",
        marks: 3,
        order: 2,
        options: [
          { id: "opt-5", text: "Only once, on mount", isCorrect: false },
          { id: "opt-6", text: "After every render", isCorrect: true },
          { id: "opt-7", text: "Only on unmount", isCorrect: false },
        ],
      },
    ],
    createdAt: "2026-08-03T10:00:00Z",
    updatedAt: "2026-08-03T10:00:00Z",
  },
  {
    id: "quiz-2",
    title: "TypeScript Generics Quiz",
    description: "Assess knowledge of generic types and constraints.",
    courseId: "course-1",
    courseName: "Modern React Development",
    lessonId: "lesson-2",
    lessonName: "Advanced TypeScript",
    passingScore: 70,
    status: "Draft",
    questions: [
      {
        id: "q-3",
        text: "What symbol denotes a generic type parameter?",
        marks: 1,
        order: 1,
        options: [
          { id: "opt-8", text: "<T>", isCorrect: true },
          { id: "opt-9", text: "[T]", isCorrect: false },
          { id: "opt-10", text: "{T}", isCorrect: false },
        ],
      },
    ],
    createdAt: "2026-08-17T13:00:00Z",
    updatedAt: "2026-08-17T13:00:00Z",
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------- READ ----------
export async function fetchQuizzes(): Promise<Quiz[]> {
  await delay(600);
  return [...quizzes];
}

export async function fetchQuizById(id: string): Promise<Quiz | undefined> {
  await delay(400);
  return quizzes.find((q) => q.id === id);
}

// ---------- CREATE ----------
export async function createQuiz(data: QuizFormData): Promise<Quiz> {
  await delay(700);

  const newQuiz: Quiz = {
    id: `quiz-${Date.now()}`,
    title: data.title,
    description: data.description,
    courseId: data.courseId,
    courseName: resolveCourseName(data.courseId),
    lessonId: data.lessonId,
    lessonName: resolveLessonName(data.lessonId),
    questions: data.questions,
    durationMinutes: data.durationMinutes,
    passingScore: data.passingScore,
    status: "Draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  quizzes = [newQuiz, ...quizzes];
  return newQuiz;
}

// ---------- UPDATE ----------
export async function updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz> {
  await delay(500);

  const index = quizzes.findIndex((q) => q.id === id);
  if (index === -1) throw new Error("Quiz not found");

  quizzes[index] = {
    ...quizzes[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return quizzes[index];
}

// ---------- DELETE ----------
export async function deleteQuiz(id: string): Promise<void> {
  await delay(400);
  quizzes = quizzes.filter((q) => q.id !== id);
}