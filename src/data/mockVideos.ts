import type{ Video, VideoFormData } from "../types/cms";
import { resolveCourseName, resolveLessonName } from "./mockCourses";

let videos: Video[] = [
  {
    id: "vid-1",
    title: "Introduction to React Hooks",
    description: "A beginner-friendly walkthrough of useState and useEffect.",
    thumbnailUrl: "https://placehold.co/320x180?text=React+Hooks",
    fileUrl: "https://example.com/videos/react-hooks.mp4",
    fileName: "react-hooks-intro.mp4",
    fileSize: 52428800,
    duration: 632,
    courseId: "course-1",
    courseName: "Modern React Development",
    lessonId: "lesson-1",
    lessonName: "State Management Basics",
    status: "Published",
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-01T10:05:00Z",
  },
  {
    id: "vid-2",
    title: "TypeScript Generics Explained",
    description: "Deep dive into generic types and constraints.",
    thumbnailUrl: "https://placehold.co/320x180?text=TS+Generics",
    fileUrl: "https://example.com/videos/ts-generics.mp4",
    fileName: "ts-generics.mp4",
    fileSize: 78643200,
    duration: 845,
    courseId: "course-1",
    courseName: "Modern React Development",
    lessonId: "lesson-2",
    lessonName: "Advanced TypeScript",
    status: "Draft",
    createdAt: "2026-08-15T14:30:00Z",
    updatedAt: "2026-08-15T14:30:00Z",
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------- READ ----------
export async function fetchVideos(): Promise<Video[]> {
  await delay(600);
  return [...videos];
}

export async function fetchVideoById(id: string): Promise<Video | undefined> {
  await delay(400);
  return videos.find((v) => v.id === id);
}

// ---------- CREATE ----------
export async function createVideo(data: VideoFormData): Promise<Video> {
  await delay(800);

  const newVideo: Video = {
    id: `vid-${Date.now()}`,
    title: data.title,
    description: data.description,
    thumbnailUrl: data.thumbnail
      ? URL.createObjectURL(data.thumbnail)
      : "https://placehold.co/320x180?text=No+Thumbnail",
    fileUrl: data.file ? URL.createObjectURL(data.file) : "",
    fileName: data.file?.name ?? "unknown.mp4",
    fileSize: data.file?.size ?? 0,
    courseId: data.courseId,
    courseName: resolveCourseName(data.courseId), // ← was hardcoded
    lessonId: data.lessonId,
    lessonName: resolveLessonName(data.lessonId), // ← was hardcoded
    status: "Processing",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  videos = [newVideo, ...videos];
  return newVideo;
}

// ---------- UPDATE ----------
export async function updateVideo(
  id: string,
  updates: Partial<Video>
): Promise<Video> {
  await delay(500);

  const index = videos.findIndex((v) => v.id === id);
  if (index === -1) throw new Error("Video not found");

  videos[index] = {
    ...videos[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return videos[index];
}

// ---------- RETRY ----------
// Re-attempts processing for a video stuck in "Failed" status.
export async function retryVideoProcessing(id: string): Promise<Video> {
  await delay(400);

  const index = videos.findIndex((v) => v.id === id);
  if (index === -1) throw new Error("Video not found");

  videos[index] = {
    ...videos[index],
    status: "Processing",
    errorMessage: undefined,
    updatedAt: new Date().toISOString(),
  };

  return videos[index];
}

// ---------- DELETE ----------
export async function deleteVideo(id: string): Promise<void> {
  await delay(400);
  videos = videos.filter((v) => v.id !== id);
}