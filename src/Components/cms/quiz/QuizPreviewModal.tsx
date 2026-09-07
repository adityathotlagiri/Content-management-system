import type{ QuizFormData } from "../../../types/cms";

interface QuizPreviewModalProps {
  quiz: QuizFormData;
  onClose: () => void;
}

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

export function QuizPreviewModal({ quiz, onClose }: QuizPreviewModalProps) {
  const sortedQuestions = [...quiz.questions].sort((a, b) => a.order - b.order);
  const totalMarks = quiz.questions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {quiz.title || "Untitled quiz"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{quiz.description}</p>
            <div className="flex flex-wrap gap-x-3 text-xs text-gray-400 mt-2">
              <span>{sortedQuestions.length} question{sortedQuestions.length !== 1 ? "s" : ""}</span>
              <span>·</span>
              <span>{totalMarks} total marks</span>
              <span>·</span>
              <span>{quiz.durationMinutes ? `${quiz.durationMinutes} min` : "No time limit"}</span>
              <span>·</span>
              <span>Pass at {quiz.passingScore}%</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-5 space-y-5">
          {sortedQuestions.map((question, i) => (
            <div key={question.id}>
              <p className="font-medium text-gray-900">
                {i + 1}. {question.text || "Untitled question"}{" "}
                <span className="text-xs text-gray-400 font-normal">
                  ({question.marks} mark{question.marks !== 1 ? "s" : ""})
                </span>
              </p>
              <div className="mt-2 space-y-1.5">
                {question.options.map((option, j) => (
                  <div
                    key={option.id}
                    className={`flex items-center gap-2.5 text-sm px-3 py-2 rounded-lg ${
                      option.isCorrect
                        ? "bg-[#238B45]/10 text-[#036724] font-medium"
                        : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span className="shrink-0 w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
                      {OPTION_LABELS[j] ?? j + 1}
                    </span>
                    {option.text || "Empty option"}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}