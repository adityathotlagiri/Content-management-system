/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type{ Document } from "../../../types/cms";
import { fetchDocuments, updateDocument, deleteDocument } from "../../../data/mockDocuments";
import { DocumentCard } from "../../../Components/cms/document/DocumentCard";
import { ConfirmDialog } from "../../../Components/cms/shared/ConfirmDialog";
import { EmptyState } from "../../../Components/cms/shared/EmptyState";
import { useCMSAuth } from "../../../context/CMSAuthContext";
import { useToast } from "../../../context/ToastContext";

export default function DocumentListPage() {
  const navigate = useNavigate();
  const { canCreate } = useCMSAuth();
  const { showSuccess, showError } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchDocuments();
    setDocuments(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleEdit = (document: Document) => {
    navigate(`/cms/documents/${document.id}/edit`);
  };

  const handleTogglePublish = async (document: Document) => {
    try {
      const newStatus = document.status === "Published" ? "Draft" : "Published";
      const updated = await updateDocument(document.id, { status: newStatus });
      setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      showSuccess(`"${updated.title}" is now ${newStatus.toLowerCase()}.`);
    } catch {
      showError("Failed to update document status.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDocument(documentToDelete.id);
      setDocuments((prev) => prev.filter((d) => d.id !== documentToDelete.id));
      showSuccess("Document deleted successfully.");
    } catch {
      showError("Failed to delete document.");
    } finally {
      setIsDeleting(false);
      setDocumentToDelete(null);
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
              Documents
            </h1>
            <p className="text-white/70 text-sm mt-1">
              Upload and manage supporting materials for your lessons
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => navigate("/cms/documents/upload")}
              className="shrink-0 px-4 sm:px-5 py-2.5 rounded-lg bg-white text-[#0B3D24] text-sm font-medium hover:bg-[#F7FAF8] transition-colors"
            >
              Upload Document
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <EmptyState
            title="No documents yet"
            description={
              canCreate
                ? "Upload your first document to get started."
                : "No documents have been uploaded yet."
            }
            actionLabel={canCreate ? "Upload Document" : undefined}
            onAction={canCreate ? () => navigate("/cms/documents/upload") : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onEdit={handleEdit}
                onDelete={setDocumentToDelete}
                onTogglePublish={handleTogglePublish}
              />
            ))}
          </div>
        )}
      </div>

      {documentToDelete && (
        <ConfirmDialog
          title="Delete document?"
          message={`"${documentToDelete.title}" will be permanently removed. This cannot be undone.`}
          confirmLabel="Delete"
          isDangerous
          isProcessing={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDocumentToDelete(null)}
        />
      )}
    </div>
  );
}