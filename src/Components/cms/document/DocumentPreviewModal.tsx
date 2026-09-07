import type { Document } from "../../../types/cms";

interface DocumentPreviewModalProps {
  document: Document;
  onClose: () => void;
}

export function DocumentPreviewModal({ document, onClose }: DocumentPreviewModalProps) {
  const isPdf = document.fileType === "application/pdf";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 flex items-start justify-between gap-4 border-b border-gray-100">
          <div>
            <h3 className="font-medium text-gray-900">{document.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{document.description}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50">
          {isPdf ? (
            <iframe
              src={document.fileUrl}
              title={document.title}
              className="w-full h-full min-h-[60vh]"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-gray-500 text-sm">
                Preview isn't available for this file type.
              </p>
              <a
                href={document.fileUrl}
                download={document.fileName}
                className="px-4 py-2 rounded-lg bg-[#238B45] text-white text-sm font-medium hover:bg-[#036724]"
              >
                Download {document.fileName}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}