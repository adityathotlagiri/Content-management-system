// src/Components/cms/shared/ConfirmDialog.tsx

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  isDangerous?: boolean; // red confirm button for destructive actions
  isProcessing?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  isDangerous = false,
  isProcessing = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-white rounded-xl p-5 sm:p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1.5">{message}</p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 ${
              isDangerous
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#238B45] hover:bg-[#036724]"
            }`}
          >
            {isProcessing ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}