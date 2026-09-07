import type { Video } from "../../../types/cms";

interface VideoPreviewModalProps {
  video: Video;
  onClose: () => void;
}

export function VideoPreviewModal({ video, onClose }: VideoPreviewModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="aspect-video bg-black">
          <video
            src={video.fileUrl}
            controls
            autoPlay
            className="w-full h-full"
          />
        </div>

        <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-medium text-gray-900">{video.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{video.description}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}