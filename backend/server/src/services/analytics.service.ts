import { prisma } from "../lib/prisma";

export async function getAssignmentAnalytics(assignmentId: string) {
  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
  if (!assignment) throw new Error("Assignment not found");

  const { getEnrolledStudentIds } = await import("./enrollment.service");
  const enrolledStudentIds = await getEnrolledStudentIds(assignment.courseId);

  const submissions = await prisma.assignmentSubmission.findMany({
    where: { assignmentId },
    include: { aiGradingResult: true },
  });

  const submittedCount = submissions.length;
  const lateCount = submissions.filter((s) => s.isLate).length;
  const enrolledCount = enrolledStudentIds.length || 1;

  const scores = submissions
    .map((s) => s.aiGradingResult?.finalScore)
    .filter((s): s is number => s != null);

  const sorted = [...scores].sort((a, b) => a - b);
  const average = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  const median = scores.length
    ? sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)]
    : null;
  const highest = scores.length ? Math.max(...scores) : null;
  const lowest = scores.length ? Math.min(...scores) : null;

  const rubricEvaluations = await prisma.rubricEvaluation.findMany({
    where: { gradingResult: { submission: { assignmentId } } },
    include: { criterion: true },
  });

  const criterionMap = new Map<string, { title: string; scores: number[]; maxMarks: number }>();
  for (const evalRow of rubricEvaluations) {
    const key = evalRow.criterionId;
    if (!criterionMap.has(key)) {
      criterionMap.set(key, { title: evalRow.criterion.title, scores: [], maxMarks: evalRow.criterion.maxMarks });
    }
    criterionMap.get(key)!.scores.push(evalRow.teacherOverridden ? evalRow.teacherScore ?? evalRow.aiScore : evalRow.aiScore);
  }
  const rubricWisePerformance = Array.from(criterionMap.entries()).map(([id, data]) => ({
    criterionId: id,
    title: data.title,
    averageScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
    maxMarks: data.maxMarks,
  }));

  const aiVsTeacherDiffs = submissions
    .filter((s) => s.aiGradingResult?.suggestedScore != null && s.aiGradingResult?.finalScore != null)
    .map((s) => ({
      submissionId: s.id,
      aiScore: s.aiGradingResult!.suggestedScore!,
      finalScore: s.aiGradingResult!.finalScore!,
      difference: s.aiGradingResult!.finalScore! - s.aiGradingResult!.suggestedScore!,
    }));

  const avgAiVsTeacherDiff = aiVsTeacherDiffs.length
    ? aiVsTeacherDiffs.reduce((sum, d) => sum + d.difference, 0) / aiVsTeacherDiffs.length
    : null;

  const commonWeaknesses: Record<string, number> = {};
  for (const s of submissions) {
    for (const w of s.aiGradingResult?.weaknesses ?? []) {
      commonWeaknesses[w] = (commonWeaknesses[w] ?? 0) + 1;
    }
  }
  const topWeaknesses = Object.entries(commonWeaknesses)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([text, count]) => ({ text, count }));

  return {
    submissionRate: submittedCount / enrolledCount,
    completionRate: submissions.filter((s) => s.status === "GRADED").length / enrolledCount,
    lateSubmissionRate: submittedCount ? lateCount / submittedCount : 0,
    averageScore: average,
    medianScore: median,
    highestScore: highest,
    lowestScore: lowest,
    rubricWisePerformance,
    commonMistakes: topWeaknesses,
    aiVsTeacherGradingDifference: avgAiVsTeacherDiff,
  };
}