import { useDeadlineTracker, type DeadlineCategory } from "../../../hooks/useDeadlineTracker";

interface DeadlineCountdownProps {
  deadline: string;
  isCompleted?: boolean;
  compact?: boolean; // compact = inline text only, no badge wrapper
}

const CATEGORY_STYLE: Record<DeadlineCategory, string> = {
  UPCOMING: "bg-gray-100 text-gray-600",
  DUE_SOON: "bg-amber-50 text-amber-600",
  DUE_TODAY: "bg-orange-50 text-orange-600",
  OVERDUE: "bg-red-50 text-red-600",
  COMPLETED: "bg-emerald-50 text-emerald-600",
};

export function DeadlineCountdown({ deadline, isCompleted, compact }: DeadlineCountdownProps) {
  const status = useDeadlineTracker(deadline, isCompleted);

  if (compact) {
    return (
      <span className={`text-xs font-medium ${CATEGORY_STYLE[status.category].split(" ")[1]}`}>
        {status.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${CATEGORY_STYLE[status.category]}`}
    >
      {status.category === "DUE_TODAY" && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
      )}
      {status.label}
    </span>
  );
}