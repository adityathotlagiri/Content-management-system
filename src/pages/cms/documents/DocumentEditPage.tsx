import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Document } from "../../../types/cms";
import { fetchDocumentById, updateDocument } from "../../../data/mockDocuments";

export default function DocumentEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchDocumentById(id).then((result) => {
      if (result) {
        setDocument(result);
      } else {
        setNotFound(true);
      }
      setIsLoading(false);
    });
  }, [id]);

  const handleSave = async () => {
    if (!document) return;
    setIsSaving(true);
    await updateDocument(document.id, {
      title: document.title,
      description: document.description,
    });
    setIsSaving(false);
    navigate("/cms/documents");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7FAF8] flex items-center justify-center">
        <p className="text-gray-500">Loading document...</p>
      </div>
    );
  }

  if (notFound || !document) {
    return (
      <div className="min-h-screen bg-[#F7FAF8] p-6">
        <p className="text-gray-700">Document not found.</p>
        <button
          onClick={() => navigate("/cms/documents")}
          className="mt-3 text-sm font-medium text-[#238B45] hover:text-[#036724]"
        >
          Back to documents
        </button>
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
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Edit Document
          </h2>
          <p className="text-white/70 text-sm mt-1">
            Update title and description for this document
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
              value={document.title}
              onChange={(e) => setDocument({ ...document, title: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#238B45]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              value={document.description}
              onChange={(e) => setDocument({ ...document, description: e.target.value })}
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
              onClick={() => navigate("/cms/documents")}
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