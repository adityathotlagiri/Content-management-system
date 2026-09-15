/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Assignment } from "../../../types/homework";
import { StatusBadge } from "../../cms/shared/StatusBadge";
import { DeadlineCountdown } from "../shared/DeadlineCountdown";

interface AssignmentCardProps {
  assignment: Assignment;
  onEdit: (assignment: Assignment) => void;
  onDuplicate: (assignment: Assignment) => void;
  onArchive: (assignment: Assignment) => void;
  onPublish: (assignment: Assignment) => void;
  onClose: (assignment: Assignment) => void;
  onViewSubmissions: (assignment: Assignment) => void;
  onViewAnalytics: (assignment: Assignment) => void; // ← add this
}

const DIFFICULTY_COLOR: Record<string, string> = {
  EASY: "bg-emerald-50 text-emerald-600",
  MEDIUM: "bg-amber-50 text-amber-600",
  HARD: "bg-red-50 text-red-600",
};


export function AssignmentCard({
  assignment,
  onEdit,
  onDuplicate,
  onArchive,
  onPublish,
  onClose,
  onViewSubmissions,
  onViewAnalytics,
}: AssignmentCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-gray-900 line-clamp-1">{assignment.title}</h3>
        <StatusBadge status={assignment.status as any} />
      </div>

      <p className="text-sm text-gray-500 line-clamp-2 mt-1">{assignment.description}</p>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${DIFFICULTY_COLOR[assignment.difficultyLevel]}`}
        >
          {assignment.difficultyLevel}
        </span>
        <span className="text-xs text-gray-400">{assignment.courseName}</span>
      </div>

      <div className="flex flex-wrap gap-x-3 text-xs text-gray-400 mt-2">
        <span>{assignment.maxMarks} marks</span>
        <span>·</span>
        <DeadlineCountdown
          deadline={assignment.submissionDeadline}
          isCompleted={assignment.status === "CLOSED"}
          compact
        />
        {assignment.version > 1 && (
          <>
            <span>·</span>
            <span>v{assignment.version}</span>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-3">
        <button
          onClick={() => onEdit(assignment)}
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Edit
        </button>
        <button
          onClick={() => onViewSubmissions(assignment)}
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Submissions
        </button>
        <button
          onClick={() => onViewAnalytics(assignment)}
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Analytics
        </button>
        <button
          onClick={() => onDuplicate(assignment)}
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Duplicate
        </button>
        {(assignment.status === "DRAFT" || assignment.status === "SCHEDULED") && (
          <button
            onClick={() => onPublish(assignment)}
            className="text-sm font-medium text-[#238B45] hover:text-[#036724]"
          >
            Publish
          </button>
        )}
        {assignment.status === "PUBLISHED" && (
          <button
            onClick={() => onClose(assignment)}
            className="text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            Close
          </button>
        )}
        <button
          onClick={() => onArchive(assignment)}
          className="text-sm font-medium text-red-600 hover:text-red-700"
        >
          Archive
        </button>
      </div>
    </div>
  );
}