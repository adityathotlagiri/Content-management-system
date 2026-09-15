/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import type { TeacherDashboardData, DashboardFilters } from "../types/homework";
import { fetchTeacherDashboard } from "../data/dashboardApi";

// TODO: replace with the actual logged-in teacher's id once real auth exists
const CURRENT_TEACHER_ID = "user-1";

export function useGradingDashboard() {
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<DashboardFilters>({});

  const load = useCallback(async (activeFilters: DashboardFilters) => {
    setIsLoading(true);
    try {
      const result = await fetchTeacherDashboard(CURRENT_TEACHER_ID, activeFilters);
      setData(result);
    } catch {
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filters);
  }, [load, filters]);

  return { data, isLoading, filters, setFilters, refetch: () => load(filters) };
}