import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import type { AssignmentAnalytics } from "../../../types/homework";
import { fetchAssignmentAnalytics } from "../../../data/analyticsApi";
import { StatCard } from "../../../Components/homework/shared/StatCard";
import { EmptyState } from "../../../Components/cms/shared/EmptyState";

const pct = (n: number) => `${Math.round(n * 100)}%`;

export default function AnalyticsPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const [data, setData] = useState<AssignmentAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!assignmentId) return;
    fetchAssignmentAnalytics(assignmentId)
      .then(setData)
      .finally(() => setIsLoading(false));
  }, [assignmentId]);

  return (
    <div className="min-h-screen bg-[#F7FAF8]">
      <div
        className="px-4 sm:px-6 py-8 sm:py-10"
        style={{ background: "linear-gradient(135deg, #0B3D24 0%, #238B45 55%, #3FAE63 100%)" }}
      >
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Analytics</h1>
          <p className="text-white/70 text-sm mt-1">Performance breakdown for this assignment</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 rounded-xl bg-white border border-gray-200 animate-pulse" />)}
          </div>
        ) : !data ? (
          <EmptyState title="Couldn't load analytics" description="Please try again later." />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Submission Rate" value={pct(data.submissionRate)} />
              <StatCard label="Completion Rate" value={pct(data.completionRate)} />
              <StatCard label="Late Rate" value={pct(data.lateSubmissionRate)} accent="warning" />
              <StatCard label="Avg Score" value={data.averageScore?.toFixed(1) ?? "—"} />
              <StatCard label="Median Score" value={data.medianScore?.toFixed(1) ?? "—"} />
              <StatCard label="Highest" value={data.highestScore ?? "—"} />
              <StatCard label="Lowest" value={data.lowestScore ?? "—"} accent="danger" />
              <StatCard
                label="AI vs Teacher Diff"
                value={data.aiVsTeacherGradingDifference != null ? data.aiVsTeacherGradingDifference.toFixed(1) : "—"}
              />
            </div>

            {data.rubricWisePerformance.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Rubric-wise Performance</h3>
                <div className="space-y-2">
                  {data.rubricWisePerformance.map((r) => (
                    <div key={r.criterionId} className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-white">
                      <p className="text-sm text-gray-900">{r.title}</p>
                      <p className="text-sm font-medium text-[#238B45]">{r.averageScore.toFixed(1)} / {r.maxMarks}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.commonMistakes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Common Mistakes</h3>
                <div className="space-y-2">
                  {data.commonMistakes.map((m, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-white">
                      <p className="text-sm text-gray-700">{m.text}</p>
                      <span className="text-xs text-gray-400">{m.count} students</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}