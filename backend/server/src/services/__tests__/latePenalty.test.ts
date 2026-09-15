import { describe, it, expect } from "vitest";

function calculatePenaltyPercent(hoursLate: number, penaltyPerDay: number): number {
  return Math.min(100, penaltyPerDay * Math.ceil(hoursLate / 24));
}

describe("late penalty calculation", () => {
  it("applies one day's penalty for < 24 hours late", () => {
    expect(calculatePenaltyPercent(5, 10)).toBe(10);
  });

  it("applies two day's penalty for 25-48 hours late", () => {
    expect(calculatePenaltyPercent(25, 10)).toBe(20);
  });

  it("caps penalty at 100%", () => {
    expect(calculatePenaltyPercent(500, 10)).toBe(100);
  });
});