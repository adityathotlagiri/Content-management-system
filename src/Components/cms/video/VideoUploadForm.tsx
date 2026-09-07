import { useVideoUpload } from "../../../hooks/useVideoUpload";
import { useCourseOptions } from "../../../hooks/useCourseOptions";
import { FileUploadZone } from "../shared/FileUploadZone";
import { ProgressBar } from "../shared/ProgressBar";
import { StatusBadge } from "../shared/StatusBadge";

export function VideoUploadForm() {
  const {
    formData,
    setField,
    errors,
    isUploading,
    uploadProgress,
    uploadedVideo,
    submitUpload,
    reset,
  } = useVideoUpload();

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
            Upload Video
          </h2>
          <p className="text-white/70 text-sm mt-1">
            Add a new video to a course lesson
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 sm:p-6 -mt-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          {uploadedVideo ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{uploadedVideo.title}</h3>
                <StatusBadge status={uploadedVideo.status} />
              </div>
              {uploadedVideo.status === "Processing" && (
                <p className="text-sm text-gray-500">
                  Your video is being processed. This page will update automatically.
                </p>
              )}
              {uploadedVideo.status === "Failed" && (
                <p className="text-sm text-red-600">{uploadedVideo.errorMessage}</p>
              )}
              <button
                onClick={reset}
                className="text-sm font-medium text-[#238B45] hover:text-[#036724]"
              >
                Upload another video
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
                  placeholder="e.g. Introduction to React Hooks"
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
                  placeholder="Briefly describe this video"
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
                label="Video file"
                accept="video/mp4,video/webm,video/quicktime"
                hint="MP4, WEBM or MOV — up to 500MB"
                selectedFile={formData.file}
                onFileSelect={(file) => setField("file", file)}
                error={errors.file}
              />

              <FileUploadZone
                label="Thumbnail (optional)"
                accept="image/png,image/jpeg"
                hint="PNG or JPG"
                selectedFile={formData.thumbnail}
                onFileSelect={(file) => setField("thumbnail", file)}
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
                {isUploading ? "Uploading..." : "Upload Video"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}