import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Lesson } from "../../../types/cms";
import { useLessonBuilder } from "../../../hooks/useLessonBuilder";
import { useCourseOptions } from "../../../hooks/useCourseOptions";
import { LessonContentAttacher } from "./LessonContentAttacher";
import { LessonContentList } from "./LessonContentList";
import { LessonPreviewModal } from "./LessonPreviewModal";

interface LessonFormProps {
  existingLesson?: Lesson;
}

export function LessonForm({ existingLesson }: LessonFormProps) {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);
  const {
    formData,
    errors,
    isSaving,
    savedLesson,
    setField,
    attachContent,
    removeContent,
    moveContent,
    saveAsDraft,
    publish,
  } = useLessonBuilder(existingLesson);

  const { courses } = useCourseOptions(formData.courseId);

  if (savedLesson) {
    navigate("/cms/lessons");
    return null;
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
            {existingLesson ? "Edit Lesson" : "Create Lesson"}
          </h2>
          <p className="text-white/70 text-sm mt-1">
            Combine videos, documents, and quizzes into one lesson
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
              placeholder="e.g. State Management Basics"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={2}
              placeholder="Briefly describe this lesson"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Learning objectives
            </label>
            <textarea
              value={formData.learningObjectives}
              onChange={(e) => setField("learningObjectives", e.target.value)}
              rows={2}
              placeholder="What should learners be able to do after this lesson?"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Course</label>
            <select
              value={formData.courseId}
              onChange={(e) => setField("courseId", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium text-gray-900 px-1">
            Lesson content ({formData.content.length})
          </h3>
          <LessonContentList
            content={formData.content}
            onRemove={removeContent}
            onMoveUp={(itemId) => moveContent(itemId, "up")}
            onMoveDown={(itemId) => moveContent(itemId, "down")}
          />
          {errors.content && <p className="text-sm text-red-600">{errors.content}</p>}
        </div>

        <LessonContentAttacher onAttach={attachContent} />

        {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Preview Lesson
          </button>
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
            onClick={publish}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-lg bg-[#238B45] text-white font-medium hover:bg-[#036724] active:bg-[#42CE70] disabled:opacity-50"
          >
            {isSaving ? "Publishing..." : "Publish Lesson"}
          </button>
        </div>
      </div>

      {showPreview && (
        <LessonPreviewModal
          lesson={formData}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}