/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Components/homework/assignment/AssignmentForm.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAssignmentBuilder } from "../../../hooks/useAssignmentBuilder";
import { useCourseOptions } from "../../../hooks/useCourseOptions";
import { ASSIGNMENT_FILE_TYPE_OPTIONS, type AssignmentRubric } from "../../../types/homework";
import { fetchRubrics, attachRubricToAssignment } from "../../../data/rubricApi";
import { StatusBadge } from "../../cms/shared/StatusBadge";

export function AssignmentForm() {
  const navigate = useNavigate();
  const {
    formData,
    setField,
    toggleFileType,
    errors,
    isSaving,
    savedAssignment,
    saveAsDraft,
    schedule,
    publish,
    reset,
  } = useAssignmentBuilder();

  const { courses } = useCourseOptions(formData.courseId);

  const [rubrics, setRubrics] = useState<AssignmentRubric[]>([]);
  const [selectedRubricId, setSelectedRubricId] = useState("");

  useEffect(() => {
    // TODO: CURRENT_USER_ID placeholder, same as elsewhere until real auth exists
    fetchRubrics("user-1").then(setRubrics).catch(() => setRubrics([]));
  }, []);

  useEffect(() => {
    if (savedAssignment && selectedRubricId) {
      attachRubricToAssignment(savedAssignment.id, selectedRubricId).catch(() => {
        // Non-fatal — assignment is already saved successfully either way;
        // rubric attachment failing shouldn't block or confuse the save flow.
      });
    }
  }, [savedAssignment, selectedRubricId]);

  const handleCourseChange = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    setField("courseId", courseId);
    setField("courseName", course?.name ?? "");
  };

  if (savedAssignment) {
    return (
      <div className="min-h-screen bg-[#F7FAF8] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <h3 className="font-medium text-gray-900">{savedAssignment.title}</h3>
            <StatusBadge status={savedAssignment.status as any} />
          </div>
          <p className="text-sm text-gray-500">
            Assignment saved successfully.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={reset}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Create another
            </button>
            <button
              onClick={() => navigate("/homework/assignments")}
              className="px-4 py-2 rounded-lg bg-[#238B45] text-white text-sm font-medium hover:bg-[#036724]"
            >
              View assignments
            </button>
          </div>
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
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Create Assignment
          </h2>
          <p className="text-white/70 text-sm mt-1">
            Set up an assignment for students to complete and submit
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 sm:p-6 -mt-4 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="e.g. Build a REST API with Express"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={3}
              placeholder="What should students accomplish?"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Instructions (optional)
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setField("instructions", e.target.value)}
              rows={3}
              placeholder="Step-by-step instructions or requirements"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Course</label>
            <select
              value={formData.courseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Assignment type
              </label>
              <select
                value={formData.assignmentType}
                onChange={(e) => setField("assignmentType", e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
              >
                <option value="TEXT">Text answer</option>
                <option value="FILE_UPLOAD">File upload</option>
                <option value="CODE">Source code</option>
                <option value="MIXED">Mixed (text + files)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Difficulty
              </label>
              <select
                value={formData.difficultyLevel}
                onChange={(e) => setField("difficultyLevel", e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Rubric (optional)
            </label>
            <select
              value={selectedRubricId}
              onChange={(e) => setSelectedRubricId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
            >
              <option value="">No rubric — simple AI grading</option>
              {rubrics.map((r) => (
                <option key={r.id} value={r.id}>{r.title} ({r.criteria.length} criteria)</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">
              With a rubric, AI grading evaluates each criterion independently.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Maximum marks
              </label>
              <input
                type="number"
                min={1}
                value={formData.maxMarks}
                onChange={(e) => setField("maxMarks", Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Passing marks
              </label>
              <input
                type="number"
                min={0}
                value={formData.passingMarks}
                onChange={(e) => setField("passingMarks", Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
              />
              {errors.passingMarks && (
                <p className="mt-1 text-xs text-red-600">{errors.passingMarks}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Start date
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setField("startDate", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Submission deadline
              </label>
              <input
                type="datetime-local"
                value={formData.submissionDeadline}
                onChange={(e) => setField("submissionDeadline", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
              />
              {errors.submissionDeadline && (
                <p className="mt-1 text-xs text-red-600">{errors.submissionDeadline}</p>
              )}
            </div>
          </div>

          {formData.assignmentType !== "TEXT" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allowed file types
              </label>
              <div className="flex flex-wrap gap-2">
                {ASSIGNMENT_FILE_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleFileType(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      formData.allowedFileTypes.includes(opt.value)
                        ? "bg-[#238B45] text-white border-[#238B45]"
                        : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {errors.allowedFileTypes && (
                <p className="mt-1.5 text-xs text-red-600">{errors.allowedFileTypes}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Max file size (MB)
              </label>
              <input
                type="number"
                min={1}
                value={formData.maxFileSizeMb}
                onChange={(e) => setField("maxFileSizeMb", Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Max submission attempts
              </label>
              <input
                type="number"
                min={1}
                value={formData.maxSubmissionAttempts}
                onChange={(e) => setField("maxSubmissionAttempts", Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
              />
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowMultipleFiles}
                onChange={(e) => setField("allowMultipleFiles", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#238B45] focus:ring-[#238B45]"
              />
              <span className="text-sm text-gray-700">Allow multiple files per submission</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.lateSubmissionAllowed}
                onChange={(e) => setField("lateSubmissionAllowed", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#238B45] focus:ring-[#238B45]"
              />
              <span className="text-sm text-gray-700">Allow late submissions</span>
            </label>

            {formData.lateSubmissionAllowed && (
              <div className="pl-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Late penalty (% deducted)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={formData.latePenaltyPercent ?? ""}
                  onChange={(e) =>
                    setField(
                      "latePenaltyPercent",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  placeholder="e.g. 10"
                  className="w-full sm:w-48 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
                />
              </div>
            )}
          </div>
        </div>

        {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={saveAsDraft}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save as Draft"}
          </button>
          <button
            type="button"
            onClick={schedule}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Schedule"}
          </button>
          <button
            type="button"
            onClick={publish}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-lg bg-[#238B45] text-white font-medium hover:bg-[#036724] active:bg-[#42CE70] disabled:opacity-50"
          >
            {isSaving ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}