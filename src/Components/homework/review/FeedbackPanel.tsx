/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import type { Feedback } from "../../../types/homework";
import {
  generateFeedback,
  fetchFeedback,
  updateFeedback,
  approveFeedback,
  publishFeedback,
} from "../../../data/feedbackApi";
import { useToast } from "../../../context/ToastContext";

interface FeedbackPanelProps {
  submissionId: string;
}

// TODO: replace with the actual logged-in teacher's id once real auth exists
const CURRENT_TEACHER_ID = "user-1";

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  APPROVED: "bg-amber-50 text-amber-600",
  PUBLISHED: "bg-emerald-50 text-emerald-600",
};

export function FeedbackPanel({ submissionId }: FeedbackPanelProps) {
  const { showSuccess, showError } = useToast();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [editedComments, setEditedComments] = useState("");
  const [teacherComments, setTeacherComments] = useState("");

  const load = async () => {
    const data = await fetchFeedback(submissionId);
    setFeedback(data);
    if (data) {
      setEditedComments(data.overallComments);
      setTeacherComments(data.teacherComments ?? "");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, [submissionId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateFeedback(submissionId);
      setFeedback(result);
      setEditedComments(result.overallComments);
      showSuccess(feedback ? "Feedback regenerated." : "Feedback generated.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to generate feedback.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEdits = async () => {
    setIsActionLoading(true);
    try {
      const updated = await updateFeedback(submissionId, {
        overallComments: editedComments,
        teacherComments: teacherComments || undefined,
      });
      setFeedback(updated);
      showSuccess("Feedback updated.");
    } catch {
      showError("Failed to save edits.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsActionLoading(true);
    try {
      const updated = await approveFeedback(submissionId, CURRENT_TEACHER_ID);
      setFeedback(updated);
      showSuccess("Feedback approved.");
    } catch {
      showError("Failed to approve feedback.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePublish = async () => {
    setIsActionLoading(true);
    try {
      const updated = await publishFeedback(submissionId, CURRENT_TEACHER_ID);
      setFeedback(updated);
      showSuccess("Feedback published to student.");
    } catch {
      showError("Failed to publish feedback.");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-gray-400">Checking feedback...</p>;
  }

  if (!feedback) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-400">No feedback generated yet for this submission.</p>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-4 py-2 rounded-lg bg-[#238B45] text-white text-sm font-medium hover:bg-[#036724] disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : "Generate Feedback"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-600">
          AI-generated
        </span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[feedback.status]}`}>
          {feedback.status}
        </span>
        {feedback.regeneratedCount > 0 && (
          <span className="text-xs text-gray-400">Regenerated {feedback.regeneratedCount}x</span>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Overall comments</label>
        <textarea
          value={editedComments}
          onChange={(e) => setEditedComments(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#238B45]"
        />
      </div>

      {feedback.whatWentWell.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">What went well</p>
          <ul className="text-sm text-gray-700 list-disc list-inside space-y-0.5">
            {feedback.whatWentWell.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {feedback.areasForImprovement.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Areas for improvement</p>
          <ul className="text-sm text-gray-700 list-disc list-inside space-y-0.5">
            {feedback.areasForImprovement.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {feedback.specificMistakes.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Specific mistakes</p>
          <ul className="text-sm text-gray-700 list-disc list-inside space-y-0.5">
            {feedback.specificMistakes.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {feedback.recommendedNextSteps.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Recommended next steps</p>
          <ul className="text-sm text-gray-700 list-disc list-inside space-y-0.5">
            {feedback.recommendedNextSteps.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {feedback.suggestedResources.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Suggested resources</p>
          <ul className="text-sm text-gray-700 list-disc list-inside space-y-0.5">
            {feedback.suggestedResources.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Additional teacher comments (optional)
        </label>
        <textarea
          value={teacherComments}
          onChange={(e) => setTeacherComments(e.target.value)}
          rows={2}
          placeholder="Add your own note on top of the AI feedback"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#238B45]"
        />
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={handleSaveEdits}
          disabled={isActionLoading}
          className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Save edits
        </button>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {isGenerating ? "Regenerating..." : "Regenerate"}
        </button>
        {feedback.status === "DRAFT" && (
          <button
            onClick={handleApprove}
            disabled={isActionLoading}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 disabled:opacity-50"
          >
            Approve
          </button>
        )}
        {feedback.status !== "PUBLISHED" && (
          <button
            onClick={handlePublish}
            disabled={isActionLoading}
            className="px-3 py-1.5 rounded-lg bg-[#238B45] text-white text-xs font-medium hover:bg-[#036724] disabled:opacity-50"
          >
            Publish to student
          </button>
        )}
      </div>
    </div>
  );
}