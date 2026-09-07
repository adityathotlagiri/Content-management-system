import type { AnswerOption } from "../../../types/cms";

interface AnswerOptionRowProps {
  option: AnswerOption;
  optionLabel: string; // "A", "B", "C"...
  canRemove: boolean;
  onTextChange: (text: string) => void;
  onSetCorrect: () => void;
  onRemove: () => void;
}

export function AnswerOptionRow({
  option,
  optionLabel,
  canRemove,
  onTextChange,
  onSetCorrect,
  onRemove,
}: AnswerOptionRowProps) {
  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        onClick={onSetCorrect}
        aria-label={`Mark option ${optionLabel} as correct`}
        className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-colors ${
          option.isCorrect
            ? "border-[#238B45] bg-[#238B45] text-white"
            : "border-gray-300 text-gray-500 hover:border-gray-400"
        }`}
      >
        {optionLabel}
      </button>

      <input
        type="text"
        value={option.text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={`Answer option ${optionLabel}`}
        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#238B45]"
      />

      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove option"
          className="shrink-0 text-gray-400 hover:text-red-600 text-lg leading-none px-1"
        >
          ✕
        </button>
      )}
    </div>
  );
}