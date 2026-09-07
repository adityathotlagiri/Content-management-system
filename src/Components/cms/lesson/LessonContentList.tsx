import type{ LessonContentItem, LessonContentType } from "../../../types/cms";

interface LessonContentListProps {
  content: LessonContentItem[];
  onRemove: (itemId: string) => void;
  onMoveUp: (itemId: string) => void;
  onMoveDown: (itemId: string) => void;
}

const TYPE_META: Record<LessonContentType, { label: string; color: string }> = {
  video: { label: "Video", color: "bg-blue-50 text-blue-600" },
  document: { label: "Document", color: "bg-orange-50 text-orange-600" },
  quiz: { label: "Quiz", color: "bg-purple-50 text-purple-600" },
};

export function LessonContentList({
  content,
  onRemove,
  onMoveUp,
  onMoveDown,
}: LessonContentListProps) {
  const sorted = [...content].sort((a, b) => a.order - b.order);

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
        No content attached yet. Add videos, documents, or quizzes below.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((item, i) => {
        const meta = TYPE_META[item.contentType];
        return (
          <div
            key={item.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-200 bg-white"
          >
            <span className="shrink-0 text-sm text-gray-400 w-5 text-center">{i + 1}</span>
            <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>
              {meta.label}
            </span>
            <span className="flex-1 text-sm text-gray-800 truncate">{item.title}</span>

            <div className="shrink-0 flex items-center gap-1">
              <button
                type="button"
                onClick={() => onMoveUp(item.id)}
                disabled={i === 0}
                aria-label="Move up"
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => onMoveDown(item.id)}
                disabled={i === sorted.length - 1}
                aria-label="Move down"
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                aria-label="Remove"
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}