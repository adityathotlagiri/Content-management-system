/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import { useGradingDashboard } from "../../../hooks/useGradingDashboard";
import { StatCard } from "../../../Components/homework/shared/StatCard";
import { StatusBadge } from "../../../Components/cms/shared/StatusBadge";
import { EmptyState } from "../../../Components/cms/shared/EmptyState";

export default function GradingDashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, filters, setFilters } = useGradingDashboard();

  return (
    <div className="min-h-screen bg-[#F7FAF8]">
      <div
        className="px-4 sm:px-6 py-8 sm:py-10"
        style={{
          background: "linear-gradient(135deg, #0B3D24 0%, #238B45 55%, #3FAE63 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Grading Dashboard
          </h1>
          <p className="text-white/70 text-sm mt-1">
            Track grading progress across all your assignments
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={filters.status ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined }))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#238B45]"
          >
            <option value="">All statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="LATE">Late</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="GRADED">Graded</option>
            <option value="RESUBMISSION_REQUIRED">Resubmission Required</option>
          </select>

          <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={filters.lateOnly ?? false}
              onChange={(e) => setFilters((f) => ({ ...f, lateOnly: e.target.checked || undefined }))}
              className="w-4 h-4 rounded border-gray-300 text-[#238B45] focus:ring-[#238B45]"
            />
            Late submissions only
          </label>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-white border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : !data ? (
          <EmptyState title="Couldn't load dashboard" description="Please try again later." />
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard label="Total Assignments" value={data.totalAssignments} />
              <StatCard label="Pending Grading" value={data.pendingGrading} accent="warning" />
              <StatCard label="AI-Graded" value={data.aiGradedCount} />
              <StatCard label="Teacher-Reviewed" value={data.teacherReviewedCount} />
              <StatCard
                label="Average Score"
                value={data.averageScore != null ? data.averageScore.toFixed(1) : "—"}
              />
              <StatCard label="Late Submissions" value={data.lateSubmissionsCount} accent="danger" />
            </div>

            {/* Students requiring attention */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Students Requiring Attention
              </h3>
              {data.studentsRequiringAttention.length === 0 ? (
                <p className="text-sm text-gray-400">Nothing needs attention right now.</p>
              ) : (
                <div className="space-y-2">
                  {data.studentsRequiringAttention.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Student: {item.studentId}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={item.status as any} />
                        <button
                          onClick={() => navigate(`/homework/review/${item.id}`)}
                          className="text-sm font-medium text-[#238B45] hover:text-[#036724]"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}