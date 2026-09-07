// src/pages/cms/videos/VideoEditPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Video } from "../../../types/cms";
import { fetchVideoById, updateVideo } from "../../../data/mockVideos";

export default function VideoEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchVideoById(id).then((result) => {
      if (result) {
        setVideo(result);
      } else {
        setNotFound(true);
      }
      setIsLoading(false);
    });
  }, [id]);

  const handleSave = async () => {
    if (!video) return;
    setIsSaving(true);
    await updateVideo(video.id, {
      title: video.title,
      description: video.description,
    });
    setIsSaving(false);
    navigate("/cms/videos");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7FAF8] flex items-center justify-center">
        <p className="text-gray-500">Loading video...</p>
      </div>
    );
  }

  if (notFound || !video) {
    return (
      <div className="min-h-screen bg-[#F7FAF8] p-6">
        <p className="text-gray-700">Video not found.</p>
        <button
          onClick={() => navigate("/cms/videos")}
          className="mt-3 text-sm font-medium text-[#238B45] hover:text-[#036724]"
        >
          Back to videos
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAF8]">
      {/* Gradient hero band */}
      <div
        className="px-4 sm:px-6 py-8 sm:py-10"
        style={{
          background: "linear-gradient(135deg, #0B3D24 0%, #238B45 55%, #3FAE63 100%)",
        }}
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Edit Video
          </h2>
          <p className="text-white/70 text-sm mt-1">
            Update title and description for this video
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 sm:p-6 -mt-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={video.title}
              onChange={(e) => setVideo({ ...video, title: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              value={video.description}
              onChange={(e) => setVideo({ ...video, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-lg bg-[#238B45] text-white font-medium hover:bg-[#036724] active:bg-[#42CE70] disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => navigate("/cms/videos")}
              className="px-6 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}