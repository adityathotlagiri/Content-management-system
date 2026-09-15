/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { AssignmentSubmission } from "../../../types/homework";
import { fetchSubmissionById, finalizeGrade } from "../../../data/submissionsApi";
import { useGradingStatus } from "../../../hooks/useGradingStatus";
import { AIGradingPanel } from "./AIGradingPanel";
import { StatusBadge } from "../../cms/shared/StatusBadge";
import { useToast } from "../../../context/ToastContext";
import { FeedbackPanel } from "./FeedbackPanel";
// TODO: replace with the actual logged-in teacher's id once real auth exists
const CURRENT_TEACHER_ID = "user-1";

export function SubmissionReviewScreen() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [submission, setSubmission] = useState<AssignmentSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [finalScore, setFinalScore] = useState("");
  const [teacherComment, setTeacherComment] = useState("");
  const [isFinalizing, setIsFinalizing] = useState(false);

  const { result: gradingResult, isLoading: isGradingLoading } = useGradingStatus(submissionId);

  useEffect(() => {
    if (!submissionId) return;
    fetchSubmissionById(submissionId)
      .then(setSubmission)
      .finally(() => setIsLoading(false));
  }, [submissionId]);

  // Pre-fill the score field with the AI's suggestion once it's ready,
  // so approving is a one-click action rather than retyping the number.
  useEffect(() => {
    if (gradingResult?.suggestedScore != null && !finalScore) {
      setFinalScore(String(gradingResult.suggestedScore));
    }
  }, [gradingResult, finalScore]);

  const handleFinalize = async (approved: boolean) => {
    if (!submissionId || !finalScore) return;
    setIsFinalizing(true);
    try {
      await finalizeGrade(submissionId, {
        finalScore: Number(finalScore),
        teacherApproved: approved,
        reviewedById: CURRENT_TEACHER_ID,
        teacherComment: teacherComment || undefined,
      });
      showSuccess(approved ? "Grade approved and published." : "Grade modified and published.");
      navigate(-1);
    } catch {
      showError("Failed to finalize grade.");
    } finally {
      setIsFinalizing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7FAF8] flex items-center justify-center">
        <p className="text-gray-500">Loading submission...</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-[#F7FAF8] p-6">
        <p className="text-gray-700">Submission not found.</p>
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
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Review Submission
            </h2>
            <p className="text-white/70 text-sm mt-1">
              {submission.assignment?.title}
            </p>
          </div>
          <StatusBadge status={submission.status as any} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 sm:p-6 -mt-4 space-y-4">
        {/* Student + submission info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-2">
          <div className="flex flex-wrap gap-x-4 text-sm text-gray-600">
            <span>Student: {submission.studentId}</span>
            <span>·</span>
            <span>Attempt {submission.attemptNumber}</span>
            <span>·</span>
            <span>
              Submitted {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : "—"}
            </span>
            {submission.isLate && (
              <span className="text-amber-600 font-medium">· Late</span>
            )}
          </div>
        </div>

        {/* Submitted content */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Submitted work</h3>
          {submission.textAnswer && (
            <p className="text-sm text-gray-800 whitespace-pre-line bg-gray-50 rounded-lg p-3">
              {submission.textAnswer}
            </p>
          )}
          {submission.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {submission.attachments.map((att) => (
                <a
                  key={att.id}
                  href={att.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  {att.fileName}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* AI grading */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">AI Evaluation</h3>
          <AIGradingPanel result={gradingResult} isLoading={isGradingLoading} />
        </div>
                  {/* Feedback */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Feedback</h3>
          {submissionId && <FeedbackPanel submissionId={submissionId} />}
        </div>
        {/* Teacher finalization */}
        {submission.status !== "GRADED" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Finalize Grade</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Final score
              </label>
              <input
                type="number"
                value={finalScore}
                onChange={(e) => setFinalScore(e.target.value)}
                className="w-32 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Teacher comment (optional)
              </label>
              <textarea
                value={teacherComment}
                onChange={(e) => setTeacherComment(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleFinalize(true)}
                disabled={isFinalizing || !finalScore}
                className="px-6 py-2.5 rounded-lg bg-[#238B45] text-white font-medium hover:bg-[#036724] disabled:opacity-50"
              >
                {isFinalizing ? "Publishing..." : "Approve & Publish"}
              </button>
              <button
                onClick={() => handleFinalize(false)}
                disabled={isFinalizing || !finalScore}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                {isFinalizing ? "Publishing..." : "Modify & Publish"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}