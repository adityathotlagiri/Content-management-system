// src/Components/cms/shared/EmptyState.tsx

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-2xl text-gray-400">
        📁
      </div>
      <h3 className="font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mt-1 max-w-sm">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-5 py-2.5 rounded-lg bg-[#238B45] text-white text-sm font-medium hover:bg-[#036724] active:bg-[#42CE70]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}