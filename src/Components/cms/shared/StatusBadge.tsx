import type { ContentStatus } from "../../../types/cms";

interface StatusBadgeProps {
  status: ContentStatus | "Unpublished"; // Unpublished only used by quizzes
}

const STATUS_STYLES: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-700",
  Processing: "bg-amber-100 text-amber-700",
  Published: "bg-[#238B45]/10 text-[#036724]",
  Failed: "bg-red-100 text-red-700",
  Unpublished: "bg-gray-100 text-gray-600",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {status === "Processing" && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
      )}
      {status}
    </span>
  );
}