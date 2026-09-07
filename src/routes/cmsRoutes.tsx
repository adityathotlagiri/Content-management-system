// src/routes/cmsRoutes.tsx
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const VideoListPage = lazy(() => import("../pages/cms/videos/VideoListPage"));
const VideoUploadPage = lazy(() => import("../pages/cms/videos/VideoUploadPage"));
const VideoEditPage = lazy(() => import("../pages/cms/videos/VideoEditPage"));

const DocumentListPage = lazy(() => import("../pages/cms/documents/DocumentListPage"));
const DocumentUploadPage = lazy(() => import("../pages/cms/documents/DocumentUploadPage"));
const DocumentEditPage = lazy(() => import("../pages/cms/documents/DocumentEditPage"));

const QuizListPage = lazy(() => import("../pages/cms/quizzes/QuizListPage"));
const QuizBuilderPage = lazy(() => import("../pages/cms/quizzes/QuizBuilderPage"));
const QuizEditPage = lazy(() => import("../pages/cms/quizzes/QuizEditPage"));

const LessonListPage = lazy(() => import("../pages/cms/lessons/LessonListPage"));
const LessonCreatePage = lazy(() => import("../pages/cms/lessons/LessonCreatePage"));
const LessonEditPage = lazy(() => import("../pages/cms/lessons/LessonEditPage"));

const ContentManagementPage = lazy(() => import("../pages/cms/ContentManagementPage"));

function RouteFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 border-2 border-[#238B45] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function CMSRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="videos" element={<VideoListPage />} />
        <Route path="videos/upload" element={<VideoUploadPage />} />
        <Route path="videos/:id/edit" element={<VideoEditPage />} />

        <Route path="documents" element={<DocumentListPage />} />
        <Route path="documents/upload" element={<DocumentUploadPage />} />
        <Route path="documents/:id/edit" element={<DocumentEditPage />} />

        <Route path="quizzes" element={<QuizListPage />} />
        <Route path="quizzes/new" element={<QuizBuilderPage />} />
        <Route path="quizzes/:id/edit" element={<QuizEditPage />} />

        <Route path="lessons" element={<LessonListPage />} />
        <Route path="lessons/new" element={<LessonCreatePage />} />
        <Route path="lessons/:id/edit" element={<LessonEditPage />} />

        <Route path="content" element={<ContentManagementPage />} />
      </Routes>
    </Suspense>
  );
}