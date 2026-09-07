/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { Video } from "../../../types/cms";
import {
  fetchVideos,
  updateVideo,
  deleteVideo,
  retryVideoProcessing,
} from "../../../data/mockVideos";
import { VideoCard } from "../../../Components/cms/video/VideoCard";
import { ConfirmDialog } from "../../../Components/cms/shared/ConfirmDialog";
import { EmptyState } from "../../../Components/cms/shared/EmptyState";
import { useCMSAuth } from "../../../context/CMSAuthContext";
import { useToast } from "../../../context/ToastContext";

export default function VideoListPage() {
  const navigate = useNavigate();
  const { canCreate } = useCMSAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSuccess, showError } = useToast();

  const loadVideos = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchVideos();
    setVideos(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const handleEdit = (video: Video) => {
    navigate(`/cms/videos/${video.id}/edit`);
  };

  const handleTogglePublish = async (video: Video) => {
    try {
      const newStatus = video.status === "Published" ? "Draft" : "Published";
      const updated = await updateVideo(video.id, { status: newStatus });
      setVideos((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      showSuccess(`"${updated.title}" is now ${newStatus.toLowerCase()}.`);
    } catch {
      showError("Failed to update video status.");
    }
  };

  const handleRetry = async (video: Video) => {
    const retrying = await retryVideoProcessing(video.id);
    setVideos((prev) => prev.map((v) => (v.id === retrying.id ? retrying : v)));

    setTimeout(async () => {
      const didSucceed = Math.random() > 0.1;
      const finalVideo = await updateVideo(video.id, {
        status: didSucceed ? "Published" : "Failed",
        ...(didSucceed ? {} : { errorMessage: "Video processing failed. Please try again." }),
      });
      setVideos((prev) => prev.map((v) => (v.id === finalVideo.id ? finalVideo : v)));
    }, 2000);
  };

  const handleDeleteConfirm = async () => {
    if (!videoToDelete) return;
    setIsDeleting(true);
    try {
      await deleteVideo(videoToDelete.id);
      setVideos((prev) => prev.filter((v) => v.id !== videoToDelete.id));
      showSuccess("Video deleted successfully.");
    } catch {
      showError("Failed to delete video.");
    } finally {
      setIsDeleting(false);
      setVideoToDelete(null);
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
              Videos
            </h1>
            <p className="text-white/70 text-sm mt-1">
              Upload and manage video lessons for your courses
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => navigate("/cms/videos/upload")}
              className="shrink-0 px-4 sm:px-5 py-2.5 rounded-lg bg-white text-[#0B3D24] text-sm font-medium hover:bg-[#F7FAF8] transition-colors"
            >
              Upload Video
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 overflow-hidden animate-pulse bg-white"
              >
                <div className="aspect-video bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <EmptyState
            title="No videos yet"
            description={
              canCreate
                ? "Upload your first video to get started."
                : "No videos have been uploaded yet."
            }
            actionLabel={canCreate ? "Upload Video" : undefined}
            onAction={canCreate ? () => navigate("/cms/videos/upload") : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onEdit={handleEdit}
                onDelete={setVideoToDelete}
                onTogglePublish={handleTogglePublish}
                onRetry={handleRetry}
              />
            ))}
          </div>
        )}
      </div>

      {videoToDelete && (
        <ConfirmDialog
          title="Delete video?"
          message={`"${videoToDelete.title}" will be permanently removed. This cannot be undone.`}
          confirmLabel="Delete"
          isDangerous
          isProcessing={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setVideoToDelete(null)}
        />
      )}
    </div>
  );
}