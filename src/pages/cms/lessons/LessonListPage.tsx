/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { Lesson } from "../../../types/cms";
import {
  fetchLessons,
  updateLesson,
  deleteLesson,
  duplicateLesson,
} from "../../../data/mockLessons";
import { LessonCard } from "../../../Components/cms/lesson/LessonCard";
import { ConfirmDialog } from "../../../Components/cms/shared/ConfirmDialog";
import { EmptyState } from "../../../Components/cms/shared/EmptyState";
import { useCMSAuth } from "../../../context/CMSAuthContext";
import { useToast } from "../../../context/ToastContext";

export default function LessonListPage() {
  const navigate = useNavigate();
  const { canCreate } = useCMSAuth();
  const { showSuccess, showError } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadLessons = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchLessons();
    setLessons(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  const handleEdit = (lesson: Lesson) => {
    navigate(`/cms/lessons/${lesson.id}/edit`);
  };

  const handleTogglePublish = async (lesson: Lesson) => {
    try {
      const newStatus = lesson.status === "Published" ? "Draft" : "Published";
      const updated = await updateLesson(lesson.id, { status: newStatus });
      setLessons((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      showSuccess(`"${updated.title}" is now ${newStatus.toLowerCase()}.`);
    } catch {
      showError("Failed to update lesson status.");
    }
  };

  const handleDuplicate = async (lesson: Lesson) => {
    try {
      const copy = await duplicateLesson(lesson.id);
      setLessons((prev) => [...prev, copy]);
      showSuccess(`Duplicated as "${copy.title}".`);
    } catch {
      showError("Failed to duplicate lesson.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!lessonToDelete) return;
    setIsDeleting(true);
    try {
      await deleteLesson(lessonToDelete.id);
      setLessons((prev) => prev.filter((l) => l.id !== lessonToDelete.id));
      showSuccess("Lesson deleted successfully.");
    } catch {
      showError("Failed to delete lesson.");
    } finally {
      setIsDeleting(false);
      setLessonToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8]">
      <div
        className="px-4 sm:px-6 py-8 sm:py-10"
        style={{
          background: "linear-gradient(135deg, #0B3D24 0%, #238B45 55%, #3FAE63 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Lessons
            </h1>
            <p className="text-white/70 text-sm mt-1">
              Combine content into structured lessons for your courses
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => navigate("/cms/lessons/new")}
              className="shrink-0 px-4 sm:px-5 py-2.5 rounded-lg bg-white text-[#0B3D24] text-sm font-medium hover:bg-[#F7FAF8] transition-colors"
            >
              Create Lesson
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : lessons.length === 0 ? (
          <EmptyState
            title="No lessons yet"
            description={
              canCreate
                ? "Create your first lesson by combining videos, documents, and quizzes."
                : "No lessons have been created yet."
            }
            actionLabel={canCreate ? "Create Lesson" : undefined}
            onAction={canCreate ? () => navigate("/cms/lessons/new") : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onEdit={handleEdit}
                onDelete={setLessonToDelete}
                onDuplicate={handleDuplicate}
                onTogglePublish={handleTogglePublish}
              />
            ))}
          </div>
        )}
      </div>

      {lessonToDelete && (
        <ConfirmDialog
          title="Delete lesson?"
          message={`"${lessonToDelete.title}" will be permanently removed. This cannot be undone.`}
          confirmLabel="Delete"
          isDangerous
          isProcessing={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setLessonToDelete(null)}
        />
      )}
    </div>
  );
}