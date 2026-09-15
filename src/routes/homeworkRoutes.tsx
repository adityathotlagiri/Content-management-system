import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const AssignmentListPage = lazy(() => import("../pages/homework/teacher/AssignmentListPage"));
const AssignmentCreatePage = lazy(() => import("../pages/homework/teacher/AssignmentCreatePage"));
const SubmitAssignmentPage = lazy(() => import("../pages/homework/student/SubmitAssignmentPage"));
const SubmissionListPage = lazy(() => import("../pages/homework/teacher/SubmissionListPage"));
const SubmissionReviewPage = lazy(() => import("../pages/homework/teacher/SubmissionReviewPage"));
const GradingDashboardPage = lazy(() => import("../pages/homework/teacher/GradingDashboardPage"));
const StudentDashboardPage = lazy(() => import("../pages/homework/student/StudentDashboardPage"));
const RubricBuilderPage = lazy(() => import("../pages/homework/teacher/RubricBuilderPage"));
const AnalyticsPage = lazy(() => import("../pages/homework/teacher/AnalyticsPage"));

function RouteFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 border-2 border-[#238B45] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function HomeworkRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="assignments" element={<AssignmentListPage />} />
        <Route path="assignments/new" element={<AssignmentCreatePage />} />
        <Route path="submit/:assignmentId" element={<SubmitAssignmentPage />} />
        <Route path="assignments/:assignmentId/submissions" element={<SubmissionListPage />} />
        <Route path="review/:submissionId" element={<SubmissionReviewPage />} />
        <Route path="dashboard" element={<GradingDashboardPage />} />
        <Route path="student/dashboard" element={<StudentDashboardPage />} />
        <Route path="rubrics/new" element={<RubricBuilderPage />} />
        <Route path="assignments/:assignmentId/analytics" element={<AnalyticsPage />} />
      </Routes>
    </Suspense>
  );
}