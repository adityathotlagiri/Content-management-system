import { useNavigate } from "react-router-dom";
import { useRubricBuilder } from "../../../hooks/useRubricBuilder";

export function RubricBuilder() {
  const navigate = useNavigate();
  const {
    title,
    setTitle,
    description,
    setDescription,
    criteria,
    addCriterion,
    removeCriterion,
    updateCriterion,
    totalWeightage,
    errors,
    isSaving,
    savedRubric,
    save,
  } = useRubricBuilder();

  if (savedRubric) {
    return (
      <div className="min-h-screen bg-[#F7FAF8] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center space-y-4">
          <h3 className="font-medium text-gray-900">Rubric saved</h3>
          <p className="text-sm text-gray-500">
            "{savedRubric.title}" is ready to attach to any assignment.
          </p>
          <button
            onClick={() => navigate("/homework/assignments")}
            className="px-4 py-2 rounded-lg bg-[#238B45] text-white text-sm font-medium hover:bg-[#036724]"
          >
            Back to assignments
          </button>
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
            Create Rubric
          </h2>
          <p className="text-white/70 text-sm mt-1">
            Build a reusable grading rubric with weighted criteria
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 sm:p-6 -mt-4 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Essay Grading Rubric"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-medium text-gray-700">Criteria</h3>
            <span
              className={`text-sm font-medium ${totalWeightage === 100 ? "text-[#238B45]" : "text-amber-600"}`}
            >
              Total weight: {totalWeightage}%
            </span>
          </div>

          {criteria.map((criterion, i) => (
            <div
              key={criterion.id}
              className="rounded-xl border border-gray-200 bg-white p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-gray-400 pt-2">Criterion {i + 1}</span>
                {criteria.length > 1 && (
                  <button
                    onClick={() => removeCriterion(criterion.id)}
                    className="text-gray-400 hover:text-red-600 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <input
                type="text"
                value={criterion.title}
                onChange={(e) => updateCriterion(criterion.id, "title", e.target.value)}
                placeholder="e.g. Code Quality"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#238B45]"
              />

              <textarea
                value={criterion.description}
                onChange={(e) => updateCriterion(criterion.id, "description", e.target.value)}
                rows={2}
                placeholder="What does this criterion evaluate?"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#238B45]"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Weightage (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={criterion.weightage}
                    onChange={(e) => updateCriterion(criterion.id, "weightage", Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#238B45]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Max marks</label>
                  <input
                    type="number"
                    min={1}
                    value={criterion.maxMarks}
                    onChange={(e) => updateCriterion(criterion.id, "maxMarks", Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#238B45]"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addCriterion}
            className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-sm font-medium text-gray-600 hover:border-[#238B45] hover:text-[#238B45]"
          >
            + Add criterion
          </button>

          {errors.criteria && <p className="text-sm text-red-600">{errors.criteria}</p>}
          {errors.weightage && <p className="text-sm text-red-600">{errors.weightage}</p>}
          {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}
        </div>

        <button
          onClick={save}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-lg bg-[#238B45] text-white font-medium hover:bg-[#036724] disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Rubric"}
        </button>
      </div>
    </div>
  );
}