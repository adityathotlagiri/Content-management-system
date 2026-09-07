import { useDocumentUpload } from "../../../hooks/useDocumentUpload";
import { useCourseOptions } from "../../../hooks/useCourseOptions";
import { FileUploadZone } from "../shared/FileUploadZone";
import { ProgressBar } from "../shared/ProgressBar";
import { StatusBadge } from "../shared/StatusBadge";

export function DocumentUploadForm() {
  const {
    formData,
    setField,
    errors,
    isUploading,
    uploadProgress,
    uploadedDocument,
    submitUpload,
    reset,
  } = useDocumentUpload();

  const { courses, lessons } = useCourseOptions(formData.courseId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitUpload();
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8]">
      <div
        className="px-4 sm:px-6 py-8 sm:py-10"
        style={{
          background: "linear-gradient(135deg, #0B3D24 0%, #238B45 55%, #3FAE63 100%)",
        }}
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Upload Document
          </h2>
          <p className="text-white/70 text-sm mt-1">
            Add supporting material to a course lesson
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 sm:p-6 -mt-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          {uploadedDocument ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{uploadedDocument.title}</h3>
                <StatusBadge status={uploadedDocument.status} />
              </div>
              <p className="text-sm text-gray-500">
                Saved as a draft. Publish it from the documents list when it's ready for learners.
              </p>
              <button
                onClick={reset}
                className="text-sm font-medium text-[#238B45] hover:text-[#036724]"
              >
                Upload another document
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setField("title", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
                  placeholder="e.g. React Hooks Cheat Sheet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setField("description", e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
                  placeholder="Briefly describe this document"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Course
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Lesson
                  </label>
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

              <FileUploadZone
                label="Document file"
                accept="application/pdf,.pptx,.docx,.doc"
                hint="PDF, DOCX or PPTX — up to 50MB"
                selectedFile={formData.file}
                onFileSelect={(file) => setField("file", file)}
                error={errors.file}
              />

              {errors.form && (
                <p className="text-sm text-red-600">{errors.form}</p>
              )}

              {isUploading && (
                <ProgressBar progress={uploadProgress} label="Uploading..." />
              )}

              <button
                type="submit"
                disabled={isUploading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#238B45] text-white font-medium hover:bg-[#036724] active:bg-[#42CE70] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? "Uploading..." : "Upload Document"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}