/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { Assignment } from "../../../types/homework";
import {
  fetchAssignments,
  updateAssignmentStatus,
  duplicateAssignment,
  archiveAssignment,
} from "../../../data/assignmentsApi";
import { AssignmentCard } from "../../../Components/homework/assignment/AssignmentCard";
import { ConfirmDialog } from "../../../Components/cms/shared/ConfirmDialog";
import { EmptyState } from "../../../Components/cms/shared/EmptyState";
import { Pagination } from "../../../Components/cms/shared/Pagination";
import { useToast } from "../../../context/ToastContext";

// TODO: replace with the actual logged-in user's id once real auth exists
const CURRENT_USER_ID = "user-1";

export default function AssignmentListPage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [assignmentToArchive, setAssignmentToArchive] = useState<Assignment | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const loadAssignments = useCallback(
    async (page: number) => {
      setIsLoading(true);
      try {
        const result = await fetchAssignments({ page, pageSize: 9 });
        setAssignments(result.assignments);
        setTotalPages(result.pagination.totalPages);
      } catch {
        showError("Failed to load assignments.");
      } finally {
        setIsLoading(false);
      }
    },
    [showError]
  );

  useEffect(() => {
    loadAssignments(currentPage);
  }, [loadAssignments, currentPage]);

  const handleEdit = (assignment: Assignment) => {
    navigate(`/homework/assignments/${assignment.id}/edit`);
  };

  const handleViewSubmissions = (assignment: Assignment) => {
    navigate(`/homework/assignments/${assignment.id}/submissions`);
  };

  const handlePublish = async (assignment: Assignment) => {
    try {
      const updated = await updateAssignmentStatus(assignment.id, "PUBLISHED", CURRENT_USER_ID);
      setAssignments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      showSuccess(`"${updated.title}" published.`);
    } catch {
      showError("Failed to publish assignment.");
    }
  };
    const handleViewAnalytics = (assignment: Assignment) => {
    navigate(`/homework/assignments/${assignment.id}/analytics`);
  };
  const handleClose = async (assignment: Assignment) => {
    try {
      const updated = await updateAssignmentStatus(assignment.id, "CLOSED", CURRENT_USER_ID);
      setAssignments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      showSuccess(`"${updated.title}" closed.`);
    } catch {
      showError("Failed to close assignment.");
    }
  };

  const handleDuplicate = async (assignment: Assignment) => {
    try {
      const clone = await duplicateAssignment(assignment.id, CURRENT_USER_ID);
      setAssignments((prev) => [clone, ...prev]);
      showSuccess(`Duplicated as "${clone.title}".`);
    } catch {
      showError("Failed to duplicate assignment.");
    }
  };

  const handleArchiveConfirm = async () => {
    if (!assignmentToArchive) return;
    setIsArchiving(true);
    try {
      await archiveAssignment(assignmentToArchive.id, CURRENT_USER_ID);
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentToArchive.id));
      showSuccess("Assignment archived.");
    } catch {
      showError("Failed to archive assignment.");
    } finally {
      setIsArchiving(false);
      setAssignmentToArchive(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8]">
      <div
        className="px-4 sm:px-6 py-8 sm:py-10"
        style={{
          background: "linear-gradient(135deg, #0B3D24 0%, #238B45 55%, #3FAE63 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Assignments
            </h1>
            <p className="text-white/70 text-sm mt-1">
              Create and manage homework assignments for your courses
            </p>
          </div>
          <button
            onClick={() => navigate("/homework/assignments/new")}
            className="shrink-0 px-4 sm:px-5 py-2.5 rounded-lg bg-white text-[#0B3D24] text-sm font-medium hover:bg-[#F7FAF8] transition-colors"
          >
            Create Assignment
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse space-y-2"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <EmptyState
            title="No assignments yet"
            description="Create your first assignment to get started."
            actionLabel="Create Assignment"
            onAction={() => navigate("/homework/assignments/new")}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onArchive={setAssignmentToArchive}
                  onPublish={handlePublish}
                  onClose={handleClose}
                  onViewSubmissions={handleViewSubmissions}
                  onViewAnalytics={handleViewAnalytics}
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
      </div>

      {assignmentToArchive && (
        <ConfirmDialog
          title="Archive assignment?"
          message={`"${assignmentToArchive.title}" will be archived and hidden from this list. This can be reversed later from the database if needed.`}
          confirmLabel="Archive"
          isDangerous
          isProcessing={isArchiving}
          onConfirm={handleArchiveConfirm}
          onCancel={() => setAssignmentToArchive(null)}
        />
      )}
    </div>
  );
}