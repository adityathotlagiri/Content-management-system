// src/hooks/useDeadlineTracker.ts
import { useState, useEffect } from "react";

export type DeadlineCategory = "UPCOMING" | "DUE_SOON" | "DUE_TODAY" | "OVERDUE" | "COMPLETED";

export interface DeadlineStatus {
  category: DeadlineCategory;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  overdueDuration: string | null; // human-readable, e.g. "2 days 4 hours"
  label: string; // human-readable summary, e.g. "Due in 2 days" or "Overdue by 3 hours"
}

// "Due soon" threshold — within 48 hours but not today.
const DUE_SOON_HOURS = 48;

function classify(deadline: Date, now: Date, isCompleted: boolean): DeadlineStatus {
  if (isCompleted) {
    return {
      category: "COMPLETED",
      daysRemaining: 0,
      hoursRemaining: 0,
      minutesRemaining: 0,
      overdueDuration: null,
      label: "Completed",
    };
  }

  const diffMs = deadline.getTime() - now.getTime();
  const isSameDay =
    deadline.getFullYear() === now.getFullYear() &&
    deadline.getMonth() === now.getMonth() &&
    deadline.getDate() === now.getDate();

  if (diffMs <= 0) {
    // Overdue — compute how long ago, in a readable form.
    const overdueMs = Math.abs(diffMs);
    const days = Math.floor(overdueMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((overdueMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const overdueDuration =
      days > 0 ? `${days}d ${hours}h` : `${hours}h ${Math.floor((overdueMs / (1000 * 60)) % 60)}m`;

    return {
      category: "OVERDUE",
      daysRemaining: 0,
      hoursRemaining: 0,
      minutesRemaining: 0,
      overdueDuration,
      label: `Overdue by ${overdueDuration}`,
    };
  }

  const daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let category: DeadlineCategory;
  let label: string;

  if (isSameDay) {
    category = "DUE_TODAY";
    label = `Due today, ${hoursRemaining}h ${minutesRemaining}m left`;
  } else if (diffMs <= DUE_SOON_HOURS * 60 * 60 * 1000) {
    category = "DUE_SOON";
    label = `Due soon — ${daysRemaining}d ${hoursRemaining}h left`;
  } else {
    category = "UPCOMING";
    label = `Due in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}`;
  }

  return { category, daysRemaining, hoursRemaining, minutesRemaining, overdueDuration: null, label };
}

// Ticks every minute — a countdown doesn't need second-level precision
// for a homework deadline, and updating every minute instead of every
// second avoids unnecessary re-renders across a whole list of assignment
// cards using this hook simultaneously.
export function useDeadlineTracker(deadline: string, isCompleted = false): DeadlineStatus {
  const [status, setStatus] = useState<DeadlineStatus>(() =>
    classify(new Date(deadline), new Date(), isCompleted)
  );

  useEffect(() => {
    const update = () => setStatus(classify(new Date(deadline), new Date(), isCompleted));
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [deadline, isCompleted]);

  return status;
}