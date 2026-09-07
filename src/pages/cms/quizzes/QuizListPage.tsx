/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { Quiz } from "../../../types/cms";
import { fetchQuizzes, updateQuiz, deleteQuiz } from "../../../data/mockQuizzes";
import { QuizCard } from "../../../Components/cms/quiz/QuizCard";
import { ConfirmDialog } from "../../../Components/cms/shared/ConfirmDialog";
import { EmptyState } from "../../../Components/cms/shared/EmptyState";
import { useCMSAuth } from "../../../context/CMSAuthContext";
import { useToast } from "../../../context/ToastContext";

export default function QuizListPage() {
  const navigate = useNavigate();
  const { canCreate } = useCMSAuth();
  const { showSuccess, showError } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadQuizzes = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchQuizzes();
    setQuizzes(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  const handleEdit = (quiz: Quiz) => {
    navigate(`/cms/quizzes/${quiz.id}/edit`);
  };

  const handleTogglePublish = async (quiz: Quiz) => {
    try {
      const newStatus = quiz.status === "Published" ? "Unpublished" : "Published";
      const updated = await updateQuiz(quiz.id, { status: newStatus });
      setQuizzes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
      showSuccess(`"${updated.title}" is now ${newStatus.toLowerCase()}.`);
    } catch {
      showError("Failed to update quiz status.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!quizToDelete) return;
    setIsDeleting(true);
    try {
      await deleteQuiz(quizToDelete.id);
      setQuizzes((prev) => prev.filter((q) => q.id !== quizToDelete.id));
      showSuccess("Quiz deleted successfully.");
    } catch {
      showError("Failed to delete quiz.");
    } finally {
      setIsDeleting(false);
      setQuizToDelete(null);
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
              Quizzes
            </h1>
            <p className="text-white/70 text-sm mt-1">
              Create and manage assessments for your lessons
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => navigate("/cms/quizzes/new")}
              className="shrink-0 px-4 sm:px-5 py-2.5 rounded-lg bg-white text-[#0B3D24] text-sm font-medium hover:bg-[#F7FAF8] transition-colors"
            >
              Create Quiz
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
        ) : quizzes.length === 0 ? (
          <EmptyState
            title="No quizzes yet"
            description={
              canCreate
                ? "Create your first quiz to assess learner understanding."
                : "No quizzes have been created yet."
            }
            actionLabel={canCreate ? "Create Quiz" : undefined}
            onAction={canCreate ? () => navigate("/cms/quizzes/new") : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onEdit={handleEdit}
                onDelete={setQuizToDelete}
                onTogglePublish={handleTogglePublish}
              />
            ))}
          </div>
        )}
      </div>

      {quizToDelete && (
        <ConfirmDialog
          title="Delete quiz?"
          message={`"${quizToDelete.title}" will be permanently removed. This cannot be undone.`}
          confirmLabel="Delete"
          isDangerous
          isProcessing={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setQuizToDelete(null)}
        />
      )}
    </div>
  );
}