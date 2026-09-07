import { useState, useEffect } from "react";
import type{ LessonContentType } from "../../../types/cms";
import { fetchVideos } from "../../../data/mockVideos";
import { fetchDocuments } from "../../../data/mockDocuments";
import { fetchQuizzes } from "../../../data/mockQuizzes";

interface AttachableItem {
  contentId: string;
  title: string;
}

interface LessonContentAttacherProps {
  onAttach: (contentType: LessonContentType, contentId: string, title: string) => void;
}

const TABS: { type: LessonContentType; label: string }[] = [
  { type: "video", label: "Videos" },
  { type: "document", label: "Documents" },
  { type: "quiz", label: "Quizzes" },
];

export function LessonContentAttacher({ onAttach }: LessonContentAttacherProps) {
  const [activeTab, setActiveTab] = useState<LessonContentType>("video");
  const [items, setItems] = useState<Record<LessonContentType, AttachableItem[]>>({
    video: [],
    document: [],
    quiz: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchVideos(), fetchDocuments(), fetchQuizzes()]).then(
      ([videos, documents, quizzes]) => {
        setItems({
          video: videos.map((v) => ({ contentId: v.id, title: v.title })),
          document: documents.map((d) => ({ contentId: d.id, title: d.title })),
          quiz: quizzes.map((q) => ({ contentId: q.id, title: q.title })),
        });
        setIsLoading(false);
      }
    );
  }, []);

  const activeItems = items[activeTab];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
      <h4 className="font-medium text-gray-900 mb-3">Attach content</h4>

      <div className="flex gap-1 mb-3 border-b border-gray-100">
        {TABS.map((tab) => (
          <button
            key={tab.type}
            type="button"
            onClick={() => setActiveTab(tab.type)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.type
                ? "border-[#238B45] text-[#238B45]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400 py-4">Loading available content...</p>
      ) : activeItems.length === 0 ? (
        <p className="text-sm text-gray-400 py-4">
          No {TABS.find((t) => t.type === activeTab)?.label.toLowerCase()} available yet.
        </p>
      ) : (
        <div className="space-y-1.5 max-h-56 overflow-auto">
          {activeItems.map((item) => (
            <div
              key={item.contentId}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              <span className="text-sm text-gray-700 truncate">{item.title}</span>
              <button
                type="button"
                onClick={() => onAttach(activeTab, item.contentId, item.title)}
                className="shrink-0 text-sm font-medium text-[#238B45] hover:text-[#036724]"
              >
                + Add
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}