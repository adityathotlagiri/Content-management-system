import type { QuizQuestion } from "../../../types/cms";
import { AnswerOptionRow } from "./AnswerOptionRow";

interface QuestionEditorProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  onTextChange: (text: string) => void;
  onMarksChange: (marks: number) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onAddOption: () => void;
  onRemoveOption: (optionId: string) => void;
  onOptionTextChange: (optionId: string, text: string) => void;
  onSetCorrectOption: (optionId: string) => void;
}

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

export function QuestionEditor({
  question,
  questionNumber,
  totalQuestions,
  onTextChange,
  onMarksChange,
  onMoveUp,
  onMoveDown,
  onRemove,
  onAddOption,
  onRemoveOption,
  onOptionTextChange,
  onSetCorrectOption,
}: QuestionEditorProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-medium text-gray-900 shrink-0">
          Question {questionNumber}
        </h4>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={questionNumber === 1}
            aria-label="Move question up"
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={questionNumber === totalQuestions}
            aria-label="Move question down"
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Delete question"
            className="ml-1 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-600"
          >
            🗑
          </button>
        </div>
      </div>

      <textarea
        value={question.text}
        onChange={(e) => onTextChange(e.target.value)}
        rows={2}
        placeholder="Enter the question text"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#238B45]"
      />

      <div className="space-y-2.5">
        {question.options.map((option, i) => (
          <AnswerOptionRow
            key={option.id}
            option={option}
            optionLabel={OPTION_LABELS[i] ?? String(i + 1)}
            canRemove={question.options.length > 2}
            onTextChange={(text) => onOptionTextChange(option.id, text)}
            onSetCorrect={() => onSetCorrectOption(option.id)}
            onRemove={() => onRemoveOption(option.id)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onAddOption}
          disabled={question.options.length >= 6}
          className="text-sm font-medium text-[#238B45] hover:text-[#036724] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Add option
        </button>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">Marks</label>
          <input
            type="number"
            min={1}
            value={question.marks}
            onChange={(e) => onMarksChange(Math.max(1, Number(e.target.value)))}
            className="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#238B45]"
          />
        </div>
      </div>
    </div>
  );
}