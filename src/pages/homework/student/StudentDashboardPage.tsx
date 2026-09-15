import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { StudentDashboardData } from "../../../types/homework";
import { fetchStudentDashboard } from "../../../data/dashboardApi";
import { StatCard } from "../../../Components/homework/shared/StatCard";
import { EmptyState } from "../../../Components/cms/shared/EmptyState";
import { DeadlineCountdown } from "../../../Components/homework/shared/DeadlineCountdown";

// TODO: replace with the actual logged-in student's id once real auth exists
const CURRENT_STUDENT_ID = "student-1";

function AssignmentRow({
  title,
  deadline,
  onClick,
}: {
  title: string;
  deadline: string;
  accent?: "default" | "warning" | "danger";
  onClick: () => void;
}) {

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:shadow-sm transition-shadow text-left"
    >
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <DeadlineCountdown deadline={deadline} compact />
    </button>
  );
}

export default function StudentDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStudentDashboard(CURRENT_STUDENT_ID)
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F7FAF8]">
      <div
        className="px-4 sm:px-6 py-8 sm:py-10"
        style={{
          background: "linear-gradient(135deg, #0B3D24 0%, #238B45 55%, #3FAE63 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            My Assignments
          </h1>
          <p className="text-white/70 text-sm mt-1">Track your homework and grades</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-white border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : !data ? (
          <EmptyState title="Couldn't load your dashboard" description="Please try again later." />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Overdue" value={data.overdue.length} accent="danger" />
              <StatCard label="Due Today" value={data.dueToday.length} accent="warning" />
              <StatCard label="Pending Feedback" value={data.pendingFeedbackCount} />
              <StatCard
                label="Average Score"
                value={data.averageScore != null ? data.averageScore.toFixed(1) : "—"}
              />
            </div>

            {data.overdue.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Overdue</h3>
                <div className="space-y-2">
                  {data.overdue.map((a) => (
                    <AssignmentRow
                      key={a.id}
                      title={a.title}
                      deadline={a.submissionDeadline}
                      accent="danger"
                      onClick={() => navigate(`/homework/submit/${a.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {data.upcoming.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Upcoming</h3>
                <div className="space-y-2">
                  {data.upcoming.map((a) => (
                    <AssignmentRow
                      key={a.id}
                      title={a.title}
                      deadline={a.submissionDeadline}
                      accent={data.dueToday.some((d) => d.id === a.id) ? "warning" : "default"}
                      onClick={() => navigate(`/homework/submit/${a.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {data.graded.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Graded</h3>
                <div className="space-y-2">
                  {data.graded.map(
                    (g) =>
                      g.assignment && (
                        <div
                          key={g.assignment.id}
                          className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white"
                        >
                          <p className="text-sm font-medium text-gray-900">{g.assignment.title}</p>
                          <p className="text-sm font-semibold text-[#238B45]">
                            {g.finalScore ?? "—"} / {g.assignment.maxMarks}
                          </p>
                        </div>
                      )
                  )}
                </div>
              </div>
            )}

            {data.upcoming.length === 0 && data.overdue.length === 0 && data.graded.length === 0 && (
              <EmptyState title="Nothing here yet" description="Your assignments will show up here once your teacher publishes them." />
            )}
          </>
        )}
      </div>
    </div>
  );
}