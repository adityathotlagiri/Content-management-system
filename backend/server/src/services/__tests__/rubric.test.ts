import { describe, it, expect } from "vitest";

function weightedScore(
  criteria: { score: number; maxMarks: number; weightage: number }[]
): number {
  return criteria.reduce((sum, c) => sum + (c.score / c.maxMarks) * (c.weightage / 100), 0);
}

describe("rubric weighted scoring", () => {
  it("computes correct weighted overall score across criteria", () => {
    const criteria = [
      { score: 8, maxMarks: 10, weightage: 40 },
      { score: 5, maxMarks: 10, weightage: 60 },
    ];
    // (0.8 * 0.4) + (0.5 * 0.6) = 0.32 + 0.30 = 0.62
    expect(weightedScore(criteria)).toBeCloseTo(0.62, 5);
  });

  it("returns 1.0 when every criterion is scored perfectly", () => {
    const criteria = [
      { score: 10, maxMarks: 10, weightage: 50 },
      { score: 20, maxMarks: 20, weightage: 50 },
    ];
    expect(weightedScore(criteria)).toBeCloseTo(1.0, 5);
  });

  it("returns 0 when every criterion scores zero", () => {
    const criteria = [{ score: 0, maxMarks: 10, weightage: 100 }];
    expect(weightedScore(criteria)).toBe(0);
  });
});

function weightageSumsTo100(criteria: { weightage: number }[]): boolean {
  return criteria.reduce((sum, c) => sum + c.weightage, 0) === 100;
}

describe("rubric weightage validation", () => {
  it("accepts criteria summing to exactly 100", () => {
    expect(weightageSumsTo100([{ weightage: 40 }, { weightage: 60 }])).toBe(true);
  });

  it("rejects criteria summing to less than 100", () => {
    expect(weightageSumsTo100([{ weightage: 40 }, { weightage: 50 }])).toBe(false);
  });

  it("rejects criteria summing to more than 100", () => {
    expect(weightageSumsTo100([{ weightage: 60 }, { weightage: 60 }])).toBe(false);
  });
});