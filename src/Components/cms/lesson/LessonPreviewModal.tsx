import type{ LessonFormData, LessonContentType } from "../../../types/cms";

interface LessonPreviewModalProps {
  lesson: LessonFormData;
  onClose: () => void;
}

const TYPE_META: Record<LessonContentType, { label: string; color: string }> = {
  video: { label: "Video", color: "bg-blue-50 text-blue-600" },
  document: { label: "Document", color: "bg-orange-50 text-orange-600" },
  quiz: { label: "Quiz", color: "bg-purple-50 text-purple-600" },
};

export function LessonPreviewModal({ lesson, onClose }: LessonPreviewModalProps) {
  const sortedContent = [...lesson.content].sort((a, b) => a.order - b.order);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {lesson.title || "Untitled lesson"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{lesson.description}</p>
            {lesson.learningObjectives && (
              <p className="text-xs text-gray-400 mt-2">
                <span className="font-medium">Objectives:</span> {lesson.learningObjectives}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-5 space-y-2">
          {sortedContent.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No content attached yet.
            </p>
          ) : (
            sortedContent.map((item, i) => {
              const meta = TYPE_META[item.contentType];
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50"
                >
                  <span className="text-sm text-gray-400 w-5 text-center">{i + 1}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>
                    {meta.label}
                  </span>
                  <span className="flex-1 text-sm text-gray-800 truncate">{item.title}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}