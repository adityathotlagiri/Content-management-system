import type { CMSContentItem } from "../types/cms";
import { fetchVideos } from "./mockVideos";
import { fetchDocuments } from "./mockDocuments";
import { fetchQuizzes } from "./mockQuizzes";
import { fetchLessons } from "./mockLessons";

/**
 * Aggregates all four content types into one normalized list.
 * This is the single data source for the centralized CMS content page (12.5).
 * It doesn't have its own "table" — it reads from the four existing
 * mock data files and flattens them, so it's always in sync with
 * whatever videos/documents/quizzes/lessons actually exist.
 */
export async function fetchAllCMSContent(): Promise<CMSContentItem[]> {
  const [videos, documents, quizzes, lessons] = await Promise.all([
    fetchVideos(),
    fetchDocuments(),
    fetchQuizzes(),
    fetchLessons(),
  ]);

  const videoItems: CMSContentItem[] = videos.map((v) => ({
    id: v.id,
    contentType: "video",
    title: v.title,
    courseName: v.courseName,
    lessonName: v.lessonName,
    status: v.status,
    updatedAt: v.updatedAt,
  }));

  const documentItems: CMSContentItem[] = documents.map((d) => ({
    id: d.id,
    contentType: "document",
    title: d.title,
    courseName: d.courseName,
    lessonName: d.lessonName,
    status: d.status,
    updatedAt: d.updatedAt,
  }));

  const quizItems: CMSContentItem[] = quizzes.map((q) => ({
    id: q.id,
    contentType: "quiz",
    title: q.title,
    courseName: q.courseName,
    lessonName: q.lessonName,
    status: q.status,
    updatedAt: q.updatedAt,
  }));

  const lessonItems: CMSContentItem[] = lessons.map((l) => ({
    id: l.id,
    contentType: "lesson",
    title: l.title,
    courseName: l.courseName,
    // lessons don't belong to another lesson, so lessonName is omitted
    status: l.status,
    updatedAt: l.updatedAt,
  }));

  return [...videoItems, ...documentItems, ...quizItems, ...lessonItems];
}