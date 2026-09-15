/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import type { AIGradingResult, RubricEvaluation } from "../../../types/homework";
import { fetchRubricEvaluations, overrideCriterionScore } from "../../../data/rubricApi";

interface AIGradingPanelProps {
  result: AIGradingResult | null;
  isLoading: boolean;
}

const STATUS_MESSAGES: Record<string, string> = {
  QUEUED: "Queued for AI grading...",
  PROCESSING: "AI is grading this submission...",
};

export function AIGradingPanel({ result, isLoading }: AIGradingPanelProps) {
  const [evaluations, setEvaluations] = useState<RubricEvaluation[]>([]);
  const [overrideValues, setOverrideValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (result?.id) {
      fetchRubricEvaluations(result.id).then(setEvaluations);
    }
  }, [result?.id]);

  const handleOverride = async (criterionId: string) => {
    if (!result || !overrideValues[criterionId]) return;
    try {
      const updated = await overrideCriterionScore({
        gradingResultId: result.id,
        criterionId,
        teacherScore: Number(overrideValues[criterionId]),
      });
      setEvaluations((prev) => prev.map((e) => (e.criterionId === criterionId ? updated : e)));
    } catch {
      // silently fail — teacher can retry; not wiring a toast here to
      // keep this panel decoupled from ToastContext dependencies
    }
  };

  if (isLoading) {
    return <p className="text-sm text-gray-400">Checking grading status...</p>;
  }

  if (!result) {
    return (
      <p className="text-sm text-gray-400">
        This submission type doesn't use AI grading, or grading hasn't been queued.
      </p>
    );
  }

  if (result.status === "QUEUED" || result.status === "PROCESSING") {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="h-4 w-4 border-2 border-[#238B45] border-t-transparent rounded-full animate-spin" />
        {STATUS_MESSAGES[result.status]}
      </div>
    );
  }

  if (result.status === "FAILED") {
    return (
      <div className="bg-red-50 rounded-lg p-3 text-sm text-red-600">
        AI grading failed: {result.errorMessage ?? "Unknown error"}
      </div>
    );
  }

  // COMPLETED or REQUIRES_REVIEW — show the full evaluation
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-600">
          AI-generated
        </span>
        {result.status === "REQUIRES_REVIEW" && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-600">
            Low confidence — needs review
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div>
          <p className="text-xs text-gray-400">Suggested score</p>
          <p className="text-2xl font-semibold text-gray-900">{result.suggestedScore}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Confidence</p>
          <p className="text-lg font-medium text-gray-700">
            {result.confidenceScore != null ? `${Math.round(result.confidenceScore * 100)}%` : "—"}
          </p>
        </div>
      </div>

      {evaluations.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Rubric breakdown</p>
          <div className="space-y-2">
            {evaluations.map((evaluation) => (
              <div key={evaluation.id} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-gray-800">
                    {(evaluation as any).criterion?.title ?? "Criterion"}
                  </p>
                  <span className="text-sm text-gray-600">
                    {evaluation.teacherOverridden ? evaluation.teacherScore : evaluation.aiScore}
                    {evaluation.teacherOverridden && (
                      <span className="text-xs text-amber-600 ml-1">(overridden)</span>
                    )}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{evaluation.aiReasoning}</p>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    placeholder="Override score"
                    value={overrideValues[evaluation.criterionId] ?? ""}
                    onChange={(e) =>
                      setOverrideValues((prev) => ({ ...prev, [evaluation.criterionId]: e.target.value }))
                    }
                    className="w-28 rounded-lg border border-gray-300 px-2 py-1 text-xs"
                  />
                  <button
                    onClick={() => handleOverride(evaluation.criterionId)}
                    className="text-xs font-medium text-[#238B45] hover:text-[#036724]"
                  >
                    Override
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.strengths.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Strengths</p>
          <ul className="text-sm text-gray-700 list-disc list-inside space-y-0.5">
            {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {result.weaknesses.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Weaknesses</p>
          <ul className="text-sm text-gray-700 list-disc list-inside space-y-0.5">
            {result.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {result.missingConcepts.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Missing concepts</p>
          <ul className="text-sm text-gray-700 list-disc list-inside space-y-0.5">
            {result.missingConcepts.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      )}

      {result.improvementSuggestions.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Suggestions</p>
          <ul className="text-sm text-gray-700 list-disc list-inside space-y-0.5">
            {result.improvementSuggestions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}