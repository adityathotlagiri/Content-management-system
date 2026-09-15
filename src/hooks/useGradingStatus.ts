import { useState, useEffect, useRef } from "react";
import type { AIGradingResult } from "../types/homework";
import { fetchGradingResultBySubmission } from "../data/gradingApi";

const POLL_INTERVAL_MS = 3000;
const TERMINAL_STATUSES = ["COMPLETED", "FAILED", "REQUIRES_REVIEW"];

// Polls for an AI grading result until it reaches a terminal state,
// then stops. Used anywhere a "grading in progress..." UI is needed.
export function useGradingStatus(submissionId: string | undefined) {
  const [result, setResult] = useState<AIGradingResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!submissionId) return;

    const poll = async () => {
      try {
        const data = await fetchGradingResultBySubmission(submissionId);
        setResult(data);
        setIsLoading(false);

        if (data && TERMINAL_STATUSES.includes(data.status) && intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      } catch {
        setIsLoading(false);
      }
    };

    poll(); // fetch immediately, don't wait for the first interval tick
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [submissionId]);

  return { result, isLoading };
}