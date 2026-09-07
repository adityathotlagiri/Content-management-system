import { useState } from "react";
import type { Quiz } from "../../../types/cms";
import { StatusBadge } from "../shared/StatusBadge";
import { QuizPreviewModal } from "./QuizPreviewModal";
import { useCMSAuth } from "../../../context/CMSAuthContext";

interface QuizCardProps {
  quiz: Quiz;
  onEdit: (quiz: Quiz) => void;
  onDelete: (quiz: Quiz) => void;
  onTogglePublish: (quiz: Quiz) => void;
}

export function QuizCard({ quiz, onEdit, onDelete, onTogglePublish }: QuizCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const { canEdit, canDelete, canPublish } = useCMSAuth();
  const totalMarks = quiz.questions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-gray-900 line-clamp-1">{quiz.title}</h3>
          <StatusBadge status={quiz.status} />
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{quiz.description}</p>

        <div className="flex flex-wrap gap-x-3 text-xs text-gray-400 mt-3">
          <span>{quiz.courseName}</span>
          <span>·</span>
          <span>{quiz.lessonName}</span>
          <span>·</span>
          <span>{quiz.questions.length} questions</span>
          <span>·</span>
          <span>{totalMarks} marks</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-3">
          <button
            onClick={() => setShowPreview(true)}
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Preview
          </button>
          {canEdit && (
            <button
              onClick={() => onEdit(quiz)}
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Edit
            </button>
          )}
          {canPublish && (
            <button
              onClick={() => onTogglePublish(quiz)}
              className="text-sm font-medium text-[#238B45] hover:text-[#036724]"
            >
              {quiz.status === "Published" ? "Unpublish" : "Publish"}
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(quiz)}
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {showPreview && (
        <QuizPreviewModal quiz={quiz} onClose={() => setShowPreview(false)} />
      )}
    </>
  );
}