import type{ CMSContentType } from "../../../types/cms";

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  typeFilter: CMSContentType | "all";
  onTypeFilterChange: (t: CMSContentType | "all") => void;
  statusFilter: string | "all";
  onStatusFilterChange: (s: string | "all") => void;
  availableStatuses: string[]; // computed from actual data, so the dropdown never shows a status with zero matches
}

const TYPE_OPTIONS: { value: CMSContentType | "all"; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "video", label: "Videos" },
  { value: "document", label: "Documents" },
  { value: "quiz", label: "Quizzes" },
  { value: "lesson", label: "Lessons" },
];

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  availableStatuses,
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title, course, or lesson..."
          className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#238B45]"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
          🔍
        </span>
      </div>

      <select
        value={typeFilter}
        onChange={(e) => onTypeFilterChange(e.target.value as CMSContentType | "all")}
        className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#238B45]"
      >
        {TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#238B45]"
      >
        <option value="all">All statuses</option>
        {availableStatuses.map((status) => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>
    </div>
  );
}