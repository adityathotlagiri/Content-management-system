import { useState } from "react";
import type{ Document } from "../../../types/cms";
import { StatusBadge } from "../shared/StatusBadge";
import { formatFileSize } from "../../../hooks/useFileValidation";
import { DocumentPreviewModal } from "./DocumentPreviewModal";
import { useCMSAuth } from "../../../context/CMSAuthContext";

interface DocumentCardProps {
  document: Document;
  onEdit: (document: Document) => void;
  onDelete: (document: Document) => void;
  onTogglePublish: (document: Document) => void;
}

function getFileTypeMeta(fileType: string): { label: string; color: string } {
  if (fileType === "application/pdf") return { label: "PDF", color: "bg-red-50 text-red-600" };
  if (fileType.includes("presentation")) return { label: "PPT", color: "bg-orange-50 text-orange-600" };
  if (fileType.includes("word") || fileType.includes("document")) return { label: "DOC", color: "bg-blue-50 text-blue-600" };
  return { label: "FILE", color: "bg-gray-100 text-gray-600" };
}

export function DocumentCard({ document, onEdit, onDelete, onTogglePublish }: DocumentCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const { canEdit, canDelete, canPublish } = useCMSAuth();
  const fileMeta = getFileTypeMeta(document.fileType);

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-4 flex items-start gap-3">
          <div className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-xs font-semibold ${fileMeta.color}`}>
            {fileMeta.label}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-gray-900 line-clamp-1">{document.title}</h3>
              <StatusBadge status={document.status} />
            </div>
            <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">{document.description}</p>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-x-3 text-xs text-gray-400">
            <span>{document.courseName}</span>
            <span>·</span>
            <span>{document.lessonName}</span>
            <span>·</span>
            <span>{formatFileSize(document.fileSize)}</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-3">
            <button
              onClick={() => setShowPreview(true)}
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Preview
            </button>
            {canEdit && (
              <button
                onClick={() => onEdit(document)}
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Edit
              </button>
            )}
            {canPublish && (
              <button
                onClick={() => onTogglePublish(document)}
                className="text-sm font-medium text-[#238B45] hover:text-[#036724]"
              >
                {document.status === "Published" ? "Unpublish" : "Publish"}
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(document)}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {showPreview && (
        <DocumentPreviewModal document={document} onClose={() => setShowPreview(false)} />
      )}
    </>
  );
}