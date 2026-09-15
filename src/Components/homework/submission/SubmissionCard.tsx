/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AssignmentSubmission } from "../../../types/homework";
import { StatusBadge } from "../../cms/shared/StatusBadge";

interface SubmissionCardProps {
  submission: AssignmentSubmission;
  onReview: (submission: AssignmentSubmission) => void;
  onRequestResubmission: (submission: AssignmentSubmission) => void;
}

function formatTimestamp(ts?: string | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SubmissionCard({ submission, onReview, onRequestResubmission }: SubmissionCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-medium text-gray-900">Student: {submission.studentId}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Attempt {submission.attemptNumber} · Submitted {formatTimestamp(submission.submittedAt)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={submission.status as any} />
          {submission.isLate && (
            <span className="text-xs font-medium text-amber-600">Late</span>
          )}
        </div>
      </div>

      {submission.textAnswer && (
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{submission.textAnswer}</p>
      )}

      {submission.attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {submission.attachments.map((att) => (
            <span
              key={att.id}
              className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600"
            >
              {att.fileName}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-3">
        <button
          onClick={() => onReview(submission)}
          className="text-sm font-medium text-[#238B45] hover:text-[#036724]"
        >
          Review
        </button>
        {submission.status !== "RESUBMISSION_REQUIRED" && (
          <button
            onClick={() => onRequestResubmission(submission)}
            className="text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            Request Resubmission
          </button>
        )}
      </div>
    </div>
  );
}