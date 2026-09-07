import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Quiz } from "../../../types/cms";
import { useQuizBuilder } from "../../../hooks/useQuizBuilder";
import { useCourseOptions } from "../../../hooks/useCourseOptions";
import { QuestionEditor } from "./QuestionEditor";
import { QuizPreviewModal } from "./QuizPreviewModal";

interface QuizBuilderFormProps {
  existingQuiz?: Quiz;
}

export function QuizBuilderForm({ existingQuiz }: QuizBuilderFormProps) {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);
  const {
    formData,
    errors,
    isSaving,
    savedQuiz,
    setField,
    addQuestion,
    removeQuestion,
    updateQuestionText,
    updateQuestionMarks,
    moveQuestion,
    addOption,
    removeOption,
    updateOptionText,
    setCorrectOption,
    saveAsDraft,
    publish,
  } = useQuizBuilder(existingQuiz);

  const { courses, lessons } = useCourseOptions(formData.courseId);
  const sortedQuestions = [...formData.questions].sort((a, b) => a.order - b.order);
  const totalMarks = formData.questions.reduce((sum, q) => sum + q.marks, 0);

  if (savedQuiz) {
    navigate("/cms/quizzes");
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
            {existingQuiz ? "Edit Quiz" : "Create Quiz"}
          </h2>
          <p className="text-white/70 text-sm mt-1">
            Build questions, set the correct answers, and configure quiz rules
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
              placeholder="e.g. React Hooks Fundamentals"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={2}
              placeholder="Briefly describe this quiz"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Course</label>
              <select
                value={formData.courseId}
                onChange={(e) => {
                  setField("courseId", e.target.value);
                  setField("lessonId", "");
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
              >
                <option value="">Select course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Lesson</label>
              <select
                value={formData.lessonId}
                onChange={(e) => setField("lessonId", e.target.value)}
                disabled={!formData.courseId}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45] disabled:bg-gray-100"
              >
                <option value="">Select lesson</option>
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Duration (minutes, optional)
              </label>
              <input
                type="number"
                min={1}
                value={formData.durationMinutes ?? ""}
                onChange={(e) =>
                  setField(
                    "durationMinutes",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                placeholder="No time limit"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Passing score (%)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={formData.passingScore}
                onChange={(e) =>
                  setField("passingScore", Math.min(100, Math.max(1, Number(e.target.value))))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-medium text-gray-900">
              Questions ({sortedQuestions.length})
            </h3>
            <span className="text-sm text-gray-500">Total marks: {totalMarks}</span>
          </div>

          {sortedQuestions.map((question, i) => (
            <QuestionEditor
              key={question.id}
              question={question}
              questionNumber={i + 1}
              totalQuestions={sortedQuestions.length}
              onTextChange={(text) => updateQuestionText(question.id, text)}
              onMarksChange={(marks) => updateQuestionMarks(question.id, marks)}
              onMoveUp={() => moveQuestion(question.id, "up")}
              onMoveDown={() => moveQuestion(question.id, "down")}
              onRemove={() => removeQuestion(question.id)}
              onAddOption={() => addOption(question.id)}
              onRemoveOption={(optionId) => removeOption(question.id, optionId)}
              onOptionTextChange={(optionId, text) => updateOptionText(question.id, optionId, text)}
              onSetCorrectOption={(optionId) => setCorrectOption(question.id, optionId)}
            />
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-sm font-medium text-gray-600 hover:border-[#238B45] hover:text-[#238B45] transition-colors"
          >
            + Add question
          </button>
        </div>

        {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}
        {errors.questions && <p className="text-sm text-red-600">{errors.questions}</p>}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Preview Quiz
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
            {isSaving ? "Publishing..." : "Publish Quiz"}
          </button>
        </div>
      </div>

      {showPreview && (
        <QuizPreviewModal quiz={formData} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}