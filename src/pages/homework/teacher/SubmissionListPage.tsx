/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { AssignmentSubmission } from "../../../types/homework";
import {
  fetchSubmissionsForAssignment,
  requestResubmission,
} from "../../../data/submissionsApi";
import { SubmissionCard } from "../../../Components/homework/submission/SubmissionCard";
import { EmptyState } from "../../../Components/cms/shared/EmptyState";
import { Pagination } from "../../../Components/cms/shared/Pagination";
import { useToast } from "../../../context/ToastContext";

// TODO: replace with the actual logged-in teacher's id once real auth exists
const CURRENT_TEACHER_ID = "user-1";

interface SimilarityFlag {
  id: string;
  assignmentId: string;
  submissionAId: string;
  submissionBId: string;
  similarityPercent: number;
  status: string;
}

export default function SubmissionListPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [flags, setFlags] = useState<SimilarityFlag[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const loadSubmissions = useCallback(
    async (page: number) => {
      if (!assignmentId) return;
      setIsLoading(true);
      try {
        const result = await fetchSubmissionsForAssignment(assignmentId, { page, pageSize: 10 });
        setSubmissions(result.submissions);
        setTotalPages(result.pagination.totalPages);
      } catch {
        showError("Failed to load submissions.");
      } finally {
        setIsLoading(false);
      }
    },
    [assignmentId, showError]
  );

  useEffect(() => {
    loadSubmissions(currentPage);
  }, [loadSubmissions, currentPage]);

  const handleReview = (submission: AssignmentSubmission) => {
    navigate(`/homework/review/${submission.id}`);
  };

  const handleRequestResubmission = async (submission: AssignmentSubmission) => {
    try {
      const updated = await requestResubmission(submission.id, CURRENT_TEACHER_ID);
      setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      showSuccess("Resubmission requested.");
    } catch {
      showError("Failed to request resubmission.");
    }
  };

  const runSimilarityCheck = async () => {
    if (!assignmentId) return;
    setIsChecking(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/similarity/${assignmentId}/run`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFlags(data);
      showSuccess(`Found ${data.length} potential match${data.length !== 1 ? "es" : ""}.`);
    } catch {
      showError("Similarity check failed.");
    } finally {
      setIsChecking(false);
    }
  };

  const findStudentLabel = (submissionId: string) => {
    const submission = submissions.find((s) => s.id === submissionId);
    return submission ? `Student ${submission.studentId}` : submissionId;
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8]">
      <div
        className="px-4 sm:px-6 py-8 sm:py-10"
        style={{
          background: "linear-gradient(135deg, #0B3D24 0%, #238B45 55%, #3FAE63 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Submissions
            </h1>
            <p className="text-white/70 text-sm mt-1">
              Review student work for this assignment
            </p>
          </div>
          <button
            onClick={runSimilarityCheck}
            disabled={isChecking}
            className="shrink-0 px-4 py-2.5 rounded-lg bg-white text-[#0B3D24] text-sm font-medium hover:bg-[#F7FAF8] disabled:opacity-50"
          >
            {isChecking ? "Checking..." : "Check Similarity"}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-white border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <EmptyState
            title="No submissions yet"
            description="Students haven't submitted any work for this assignment."
          />
        ) : (
          <>
            <div className="space-y-3">
              {submissions.map((submission) => (
                <SubmissionCard
                  key={submission.id}
                  submission={submission}
                  onReview={handleReview}
                  onRequestResubmission={handleRequestResubmission}
                />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}

        {flags.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Flagged for Similarity</h3>
            {flags.map((f) => (
              <div
                key={f.id}
                className="px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-800"
              >
                <span className="font-medium">{f.similarityPercent}% similarity</span> between{" "}
                {findStudentLabel(f.submissionAId)} and {findStudentLabel(f.submissionBId)} —
                review manually.
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}