/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useMemo } from "react";
import type { CMSContentItem, CMSContentType, SortField, SortDirection } from "../types/cms";
import { fetchAllCMSContent } from "../data/mockCMSContent";

const PAGE_SIZE = 9;

interface UseCMSContentReturn {
  isLoading: boolean;
  pagedItems: CMSContentItem[];
  totalCount: number; // count after filtering, before pagination
  currentPage: number;
  totalPages: number;
  availableStatuses: string[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  typeFilter: CMSContentType | "all";
  setTypeFilter: (t: CMSContentType | "all") => void;

  statusFilter: string | "all";
  setStatusFilter: (s: string | "all") => void;

  sortField: SortField;
  sortDirection: SortDirection;
  toggleSort: (field: SortField) => void;

  setCurrentPage: (page: number) => void;
  refetch: () => void;
}

export function useCMSContent(): UseCMSContentReturn {
  const [allItems, setAllItems] = useState<CMSContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<CMSContentType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string | "all">("all");
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
      // eslint-disable-next-line react-hooks/rules-of-hooks
    const availableStatuses = useMemo(() => {
    const statuses = new Set(allItems.map((item) => item.status));
    return Array.from(statuses).sort();
  }, [allItems]);
  const loadContent = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchAllCMSContent();
    setAllItems(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, statusFilter]);

  const toggleSort = useCallback((field: SortField) => {
    setSortField((prevField) => {
      if (prevField === field) {
        // clicking the same column again flips direction
        setSortDirection((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return field;
      }
      // switching to a new column starts descending (most useful default for dates/status)
      setSortDirection("desc");
      return field;
    });
  }, []);

  // Filtering, searching, and sorting all run together here —
  // recomputed only when their actual inputs change, not on every render.
  const filteredAndSorted = useMemo(() => {
    let result = allItems;

    if (typeFilter !== "all") {
      result = result.filter((item) => item.contentType === typeFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((item) => item.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.courseName.toLowerCase().includes(q) ||
          (item.lessonName?.toLowerCase().includes(q) ?? false)
      );
    }

    const sorted = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortField === "title") comparison = a.title.localeCompare(b.title);
      if (sortField === "status") comparison = a.status.localeCompare(b.status);
      if (sortField === "updatedAt") {
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [allItems, typeFilter, statusFilter, searchQuery, sortField, sortDirection]);

  const totalCount = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSorted.slice(start, start + PAGE_SIZE);
  }, [filteredAndSorted, currentPage]);

    return {
    isLoading,
    pagedItems,
    totalCount,
    currentPage,
    totalPages,
    availableStatuses, // ← add this line
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
    refetch: loadContent,
  };
}