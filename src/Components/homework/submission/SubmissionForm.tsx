/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Assignment } from "../../../types/homework";
import { useSubmission } from "../../../hooks/useSubmission";
import { FileUploadZone } from "../../cms/shared/FileUploadZone";
import { StatusBadge } from "../../cms/shared/StatusBadge";

// Placeholder fetch until the assignment detail endpoint is wired
// into a dedicated hook — reuses the same API_BASE pattern as assignmentsApi.
async function fetchAssignmentById(id: string): Promise<Assignment> {
  const res = await fetch(`http://localhost:4000/api/assignments/${id}`);
  if (!res.ok) throw new Error("Assignment not found");
  return res.json();
}

function formatDeadline(deadline: string): string {
  return new Date(deadline).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SubmissionForm() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const { textAnswer, setTextAnswer, file, setFile, errors, isSubmitting, submittedResult, submit } =
    useSubmission();

  useEffect(() => {
    if (!assignmentId) return;
    fetchAssignmentById(assignmentId)
      .then(setAssignment)
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [assignmentId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7FAF8] flex items-center justify-center">
        <p className="text-gray-500">Loading assignment...</p>
      </div>
    );
  }

  if (notFound || !assignment) {
    return (
      <div className="min-h-screen bg-[#F7FAF8] p-6">
        <p className="text-gray-700">Assignment not found.</p>
      </div>
    );
  }

  const isPastDeadline = new Date() > new Date(assignment.submissionDeadline);
  const canStillSubmit = !isPastDeadline || assignment.lateSubmissionAllowed;

  if (submittedResult) {
    return (
      <div className="min-h-screen bg-[#F7FAF8] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <h3 className="font-medium text-gray-900">Submission received</h3>
            <StatusBadge status={submittedResult.status as any} />
          </div>
          {submittedResult.isLate && (
            <p className="text-sm text-amber-600">
              This was submitted after the deadline and is marked late.
            </p>
          )}
          <p className="text-sm text-gray-500">
            Attempt {submittedResult.attemptNumber} of {assignment.maxSubmissionAttempts}
          </p>
          <button
            onClick={() => navigate("/homework/student/dashboard")}
            className="px-4 py-2 rounded-lg bg-[#238B45] text-white text-sm font-medium hover:bg-[#036724]"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAF8]">
      <div
        className="px-4 sm:px-6 py-8 sm:py-10"
        style={{
          background: "linear-gradient(135deg, #0B3D24 0%, #238B45 55%, #3FAE63 100%)",
        }}
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            {assignment.title}
          </h2>
          <p className="text-white/70 text-sm mt-1">{assignment.description}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 sm:p-6 -mt-4 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-2">
          {assignment.instructions && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Instructions</h4>
              <p className="text-sm text-gray-600 whitespace-pre-line">{assignment.instructions}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-x-4 text-xs text-gray-400 pt-2">
            <span>Max marks: {assignment.maxMarks}</span>
            <span>·</span>
            <span className={isPastDeadline ? "text-red-500 font-medium" : ""}>
              Due {formatDeadline(assignment.submissionDeadline)}
            </span>
          </div>
        </div>

        {!canStillSubmit ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <p className="text-sm text-red-600">
              The submission deadline has passed and late submissions are not accepted for this assignment.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-5">
            {isPastDeadline && (
              <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                The deadline has passed — this submission will be marked as late.
              </p>
            )}

            {assignment.assignmentType !== "FILE_UPLOAD" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Your answer
                </label>
                <textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  rows={6}
                  placeholder="Write your answer here"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
                />
                {errors.textAnswer && (
                  <p className="mt-1 text-xs text-red-600">{errors.textAnswer}</p>
                )}
              </div>
            )}

            {assignment.assignmentType !== "TEXT" && (
              <FileUploadZone
                label="Attach your work"
                accept={assignment.allowedFileTypes.join(",")}
                hint={`Allowed: ${assignment.allowedFileTypes.join(", ")} — up to ${assignment.maxFileSizeMb}MB`}
                selectedFile={file}
                onFileSelect={setFile}
                error={errors.file}
              />
            )}

            {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

            <button
              onClick={() => submit(assignment)}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#238B45] text-white font-medium hover:bg-[#036724] active:bg-[#42CE70] disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Assignment"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}