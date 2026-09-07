import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCMSContent } from "../../hooks/useCMSContent";
import type{ CMSContentItem, CMSContentType, SortField } from "../../types/cms";
import { SearchFilterBar } from "../../Components/cms/shared/SearchFilterBar";
import { Pagination } from "../../Components/cms/shared/Pagination";
import { StatusBadge } from "../../Components/cms/shared/StatusBadge";
import { EmptyState } from "../../Components/cms/shared/EmptyState";
import { ConfirmDialog } from "../../Components/cms/shared/ConfirmDialog";
import { useCMSAuth } from "../../context/CMSAuthContext";
import { useToast } from "../../context/ToastContext";

import { updateVideo, deleteVideo } from "../../data/mockVideos";
import { updateDocument, deleteDocument } from "../../data/mockDocuments";
import { updateQuiz, deleteQuiz } from "../../data/mockQuizzes";
import { updateLesson, deleteLesson } from "../../data/mockLessons";

const TYPE_LABELS: Record<CMSContentType, string> = {
  video: "Video",
  document: "Document",
  quiz: "Quiz",
  lesson: "Lesson",
};

const TYPE_ICON_COLOR: Record<CMSContentType, string> = {
  video: "bg-blue-50 text-blue-600",
  document: "bg-orange-50 text-orange-600",
  quiz: "bg-purple-50 text-purple-600",
  lesson: "bg-emerald-50 text-emerald-600",
};

const EDIT_ROUTES: Record<CMSContentType, (id: string) => string> = {
  video: (id) => `/cms/videos/${id}/edit`,
  document: (id) => `/cms/documents/${id}/edit`,
  quiz: (id) => `/cms/quizzes/${id}/edit`,
  lesson: (id) => `/cms/lessons/${id}/edit`,
};

interface SortHeaderProps {
  field: SortField;
  label: string;
  sortField: SortField;
  sortDirection: "asc" | "desc";
  onToggle: (field: SortField) => void;
}

function SortHeader({ field, label, sortField, sortDirection, onToggle }: SortHeaderProps) {
  return (
    <button
      onClick={() => onToggle(field)}
      className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800"
    >
      {label}
      {sortField === field && <span>{sortDirection === "asc" ? "▲" : "▼"}</span>}
    </button>
  );
}

export default function ContentManagementPage() {
  const navigate = useNavigate();
  const { canEdit, canDelete, canPublish } = useCMSAuth();
  const { showSuccess, showError } = useToast();
  const {
    isLoading,
    pagedItems,
    totalCount,
    currentPage,
    totalPages,
    availableStatuses,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    sortField,
    sortDirection,
    toggleSort,
    setCurrentPage,
    refetch,
  } = useCMSContent();

  const [itemToDelete, setItemToDelete] = useState<CMSContentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleView = (item: CMSContentItem) => {
    navigate(EDIT_ROUTES[item.contentType](item.id));
  };

  const handleEdit = (item: CMSContentItem) => {
    navigate(EDIT_ROUTES[item.contentType](item.id));
  };

  const handleTogglePublish = async (item: CMSContentItem) => {
    try {
      if (item.contentType === "video") {
        await updateVideo(item.id, {
          status: item.status === "Published" ? "Draft" : "Published",
        });
      } else if (item.contentType === "document") {
        await updateDocument(item.id, {
          status: item.status === "Published" ? "Draft" : "Published",
        });
      } else if (item.contentType === "quiz") {
        await updateQuiz(item.id, {
          status: item.status === "Published" ? "Unpublished" : "Published",
        });
      } else if (item.contentType === "lesson") {
        await updateLesson(item.id, {
          status: item.status === "Published" ? "Draft" : "Published",
        });
      }
      refetch();
      showSuccess(`"${item.title}" status updated.`);
    } catch {
      showError("Failed to update status.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      if (itemToDelete.contentType === "video") await deleteVideo(itemToDelete.id);
      if (itemToDelete.contentType === "document") await deleteDocument(itemToDelete.id);
      if (itemToDelete.contentType === "quiz") await deleteQuiz(itemToDelete.id);
      if (itemToDelete.contentType === "lesson") await deleteLesson(itemToDelete.id);
      refetch();
      showSuccess(`"${itemToDelete.title}" deleted successfully.`);
    } catch {
      showError("Failed to delete content.");
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Content Management
          </h1>
          <p className="text-white/70 text-sm mt-1">
            View and manage every video, document, quiz, and lesson in one place
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4">
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          availableStatuses={availableStatuses}
        />

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-white border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : totalCount === 0 ? (
          <EmptyState
            title="No content found"
            description="Try adjusting your search or filters."
          />
        ) : (
          <>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="hidden sm:grid grid-cols-[1fr_120px_140px_120px_160px] gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
                <SortHeader
                  field="title"
                  label="Title"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onToggle={toggleSort}
                />
                <span className="text-xs font-medium text-gray-500">Type</span>
                <span className="text-xs font-medium text-gray-500">Course / Lesson</span>
                <SortHeader
                  field="status"
                  label="Status"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onToggle={toggleSort}
                />
                <SortHeader
                  field="updatedAt"
                  label="Last updated"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onToggle={toggleSort}
                />
              </div>

              <div className="divide-y divide-gray-100">
                {pagedItems.map((item) => (
                  <div
                    key={`${item.contentType}-${item.id}`}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_120px_140px_120px_160px] gap-2 sm:gap-3 px-4 py-3 items-center hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                      <div className="flex gap-2 sm:hidden mt-1">
                        <StatusBadge status={item.status} />
                      </div>
                    </div>

                    <span className={`hidden sm:inline-flex w-fit px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_ICON_COLOR[item.contentType]}`}>
                      {TYPE_LABELS[item.contentType]}
                    </span>

                    <span className="hidden sm:block text-xs text-gray-500 truncate">
                      {item.courseName}
                      {item.lessonName ? ` / ${item.lessonName}` : ""}
                    </span>

                    <div className="hidden sm:block">
                      <StatusBadge status={item.status} />
                    </div>

                    <div className="flex items-center justify-between sm:justify-start gap-3">
                      <span className="hidden sm:inline text-xs text-gray-400">
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(item)}
                          className="text-xs font-medium text-gray-600 hover:text-gray-900"
                        >
                          View
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-xs font-medium text-gray-600 hover:text-gray-900"
                          >
                            Edit
                          </button>
                        )}
                        {canPublish && (item.contentType !== "lesson" || item.status !== "Processing") && (
                          <button
                            onClick={() => handleTogglePublish(item)}
                            className="text-xs font-medium text-[#238B45] hover:text-[#036724]"
                          >
                            {item.status === "Published" ? "Unpublish" : "Publish"}
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setItemToDelete(item)}
                            className="text-xs font-medium text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {itemToDelete && (
        <ConfirmDialog
          title={`Delete ${TYPE_LABELS[itemToDelete.contentType].toLowerCase()}?`}
          message={`"${itemToDelete.title}" will be permanently removed. This cannot be undone.`}
          confirmLabel="Delete"
          isDangerous
          isProcessing={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setItemToDelete(null)}
        />
      )}
    </div>
  );
}