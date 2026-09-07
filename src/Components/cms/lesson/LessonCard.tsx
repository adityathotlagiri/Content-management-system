import type { Lesson } from "../../../types/cms";
import { StatusBadge } from "../shared/StatusBadge";
import { useCMSAuth } from "../../../context/CMSAuthContext";

interface LessonCardProps {
  lesson: Lesson;
  onEdit: (lesson: Lesson) => void;
  onDelete: (lesson: Lesson) => void;
  onDuplicate: (lesson: Lesson) => void;
  onTogglePublish: (lesson: Lesson) => void;
}

const TYPE_COUNTS_LABEL: Record<string, string> = {
  video: "video",
  document: "doc",
  quiz: "quiz",
};

export function LessonCard({
  lesson,
  onEdit,
  onDelete,
  onDuplicate,
  onTogglePublish,
}: LessonCardProps) {
  const { canCreate, canEdit, canDelete, canPublish } = useCMSAuth();

  const counts = lesson.content.reduce<Record<string, number>>((acc, item) => {
    acc[item.contentType] = (acc[item.contentType] ?? 0) + 1;
    return acc;
  }, {});
  const summary = Object.entries(counts)
    .map(([type, count]) => `${count} ${TYPE_COUNTS_LABEL[type]}${count > 1 ? "s" : ""}`)
    .join(" · ");

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-medium flex items-center justify-center">
            {lesson.sequenceOrder}
          </span>
          <h3 className="font-medium text-gray-900 line-clamp-1">{lesson.title}</h3>
        </div>
        <StatusBadge status={lesson.status} />
      </div>

      <p className="text-sm text-gray-500 line-clamp-2 mt-2">{lesson.description}</p>

      <div className="flex flex-wrap gap-x-3 text-xs text-gray-400 mt-3">
        <span>{lesson.courseName}</span>
        {summary && (
          <>
            <span>·</span>
            <span>{summary}</span>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-3">
        {canEdit && (
          <button
            onClick={() => onEdit(lesson)}
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Edit
          </button>
        )}
        {canCreate && (
          <button
            onClick={() => onDuplicate(lesson)}
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Duplicate
          </button>
        )}
        {canPublish && (
          <button
            onClick={() => onTogglePublish(lesson)}
            className="text-sm font-medium text-[#238B45] hover:text-[#036724]"
          >
            {lesson.status === "Published" ? "Unpublish" : "Publish"}
          </button>
        )}
        {canDelete && (
          <button
            onClick={() => onDelete(lesson)}
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}