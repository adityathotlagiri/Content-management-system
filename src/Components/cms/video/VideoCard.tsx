import { useState } from "react";
import type { Video } from "../../../types/cms";
import { StatusBadge } from "../shared/StatusBadge";
import { formatFileSize } from "../../../hooks/useFileValidation";
import { VideoPreviewModal } from "./VideoPreviewModal";
import { useCMSAuth } from "../../../context/CMSAuthContext";

interface VideoCardProps {
  video: Video;
  onEdit: (video: Video) => void;
  onDelete: (video: Video) => void;
  onTogglePublish: (video: Video) => void;
  onRetry: (video: Video) => void;
}

export function VideoCard({ video, onEdit, onDelete, onTogglePublish, onRetry }: VideoCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const { canEdit, canDelete, canPublish } = useCMSAuth();

  return (
    <>
      <div className="rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div
          className="relative aspect-video bg-gray-100 cursor-pointer group"
          onClick={() => video.status === "Published" && setShowPreview(true)}
        >
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          {video.status === "Published" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                ▶
              </div>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <StatusBadge status={video.status} />
          </div>
        </div>

        <div className="p-4 space-y-2">
          <h3 className="font-medium text-gray-900 line-clamp-1">{video.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2">{video.description}</p>

          <div className="flex flex-wrap gap-x-3 text-xs text-gray-400 pt-1">
            <span>{video.courseName}</span>
            <span>·</span>
            <span>{video.lessonName}</span>
            <span>·</span>
            <span>{formatFileSize(video.fileSize)}</span>
          </div>

          {video.status === "Failed" && video.errorMessage && (
            <p className="text-xs text-red-600 pt-1">{video.errorMessage}</p>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            {video.status === "Failed" && (
              <button
                onClick={() => onRetry(video)}
                className="text-sm font-medium text-amber-600 hover:text-amber-700"
              >
                Retry
              </button>
            )}
            {canEdit && (
              <button
                onClick={() => onEdit(video)}
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Edit
              </button>
            )}
            {canPublish && (video.status === "Published" || video.status === "Draft") && (
              <button
                onClick={() => onTogglePublish(video)}
                className="text-sm font-medium text-[#238B45] hover:text-[#036724]"
              >
                {video.status === "Published" ? "Unpublish" : "Publish"}
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(video)}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {showPreview && (
        <VideoPreviewModal video={video} onClose={() => setShowPreview(false)} />
      )}
    </>
  );
}