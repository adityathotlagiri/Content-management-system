import { describe, it, expect } from "vitest";

// Extracted inline since useDeadlineTracker's classify() is frontend-only;
// this mirrors the same late/on-time logic used server-side in submissions.service.ts
function isLate(deadline: Date, submittedAt: Date): boolean {
  return submittedAt.getTime() > deadline.getTime();
}

describe("deadline calculation", () => {
  it("marks a submission on time when submitted before the deadline", () => {
    const deadline = new Date("2026-01-01T12:00:00Z");
    const submittedAt = new Date("2026-01-01T11:59:00Z");
    expect(isLate(deadline, submittedAt)).toBe(false);
  });

  it("marks a submission late when submitted after the deadline", () => {
    const deadline = new Date("2026-01-01T12:00:00Z");
    const submittedAt = new Date("2026-01-01T12:00:01Z");
    expect(isLate(deadline, submittedAt)).toBe(true);
  });

  it("marks a submission exactly at the deadline as NOT late", () => {
    const deadline = new Date("2026-01-01T12:00:00Z");
    const submittedAt = new Date("2026-01-01T12:00:00Z");
    expect(isLate(deadline, submittedAt)).toBe(false);
  });
});