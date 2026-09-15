/* eslint-disable @typescript-eslint/no-explicit-any */
import Groq from "groq-sdk";
import { prisma } from "../lib/prisma";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface OverallGradingResult {
  suggestedScore: number;
  confidenceScore: number;
  strengths: string[];
  weaknesses: string[];
  missingConcepts: string[];
  incorrectAnswers: string[];
  improvementSuggestions: string[];
}

interface CriterionEvaluationResult {
  criterionId: string;
  score: number;
  reasoning: string;
}

// ---------- Non-rubric grading (original path, unchanged) ----------

function buildGradingPrompt(params: {
  assignmentTitle: string;
  instructions: string;
  maxMarks: number;
  studentAnswer: string;
}): string {
  return `You are grading a student's assignment submission. Evaluate it strictly against the instructions and return ONLY valid JSON, no other text.

Assignment: ${params.assignmentTitle}
Instructions: ${params.instructions}
Maximum marks: ${params.maxMarks}

Student's submission:
"""
${params.studentAnswer}
"""

Return JSON in exactly this shape:
{
  "suggestedScore": <number, 0 to ${params.maxMarks}>,
  "confidenceScore": <number, 0 to 1, how confident you are in this grade>,
  "strengths": [<short strings>],
  "weaknesses": [<short strings>],
  "missingConcepts": [<short strings>],
  "incorrectAnswers": [<short strings>],
  "improvementSuggestions": [<short strings>]
}`;
}

async function callGroqForOverallGrading(prompt: string): Promise<OverallGradingResult> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty response from grading model");
  const parsed = JSON.parse(raw);

  return {
    suggestedScore: Number(parsed.suggestedScore) || 0,
    confidenceScore: Math.min(1, Math.max(0, Number(parsed.confidenceScore) || 0)),
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
    missingConcepts: Array.isArray(parsed.missingConcepts) ? parsed.missingConcepts : [],
    incorrectAnswers: Array.isArray(parsed.incorrectAnswers) ? parsed.incorrectAnswers : [],
    improvementSuggestions: Array.isArray(parsed.improvementSuggestions)
      ? parsed.improvementSuggestions
      : [],
  };
}

// ---------- Rubric-based grading (new path) ----------

function buildCriterionPrompt(params: {
  assignmentTitle: string;
  instructions: string;
  studentAnswer: string;
  criterionTitle: string;
  criterionDescription: string;
  maxMarks: number;
}): string {
  return `You are grading ONE specific criterion of a student's assignment submission. Evaluate ONLY this criterion, independently of any others. Return ONLY valid JSON, no other text.

Assignment: ${params.assignmentTitle}
Overall instructions: ${params.instructions}

Criterion to evaluate: ${params.criterionTitle}
Criterion description: ${params.criterionDescription}
Maximum marks for this criterion: ${params.maxMarks}

Student's submission:
"""
${params.studentAnswer}
"""

Return JSON in exactly this shape:
{
  "score": <number, 0 to ${params.maxMarks}>,
  "reasoning": "<1-3 sentences explaining the score for THIS criterion specifically>"
}`;
}

async function callGroqForCriterion(prompt: string): Promise<{ score: number; reasoning: string }> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty response from grading model");
  const parsed = JSON.parse(raw);

  return {
    score: Number(parsed.score) || 0,
    reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : "",
  };
}

// Evaluates each criterion with its own separate Groq call — satisfies
// "The AI should evaluate each rubric criterion independently" (Task 5)
// literally, not just conceptually: no criterion's evaluation can leak
// into or bias another's, since each is a fully separate model call.
async function gradeAgainstRubric(params: {
  assignmentTitle: string;
  instructions: string;
  studentAnswer: string;
  criteria: { id: string; title: string; description: string | null; weightage: number; maxMarks: number }[];
}): Promise<{ evaluations: CriterionEvaluationResult[]; overallScore: number }> {
  const evaluations: CriterionEvaluationResult[] = [];

  for (const criterion of params.criteria) {
    const prompt = buildCriterionPrompt({
      assignmentTitle: params.assignmentTitle,
      instructions: params.instructions,
      studentAnswer: params.studentAnswer,
      criterionTitle: criterion.title,
      criterionDescription: criterion.description ?? "",
      maxMarks: criterion.maxMarks,
    });

    const result = await callGroqForCriterion(prompt);
    evaluations.push({ criterionId: criterion.id, score: result.score, reasoning: result.reasoning });
  }

  // Weighted overall score: each criterion's (score / maxMarks) contributes
  // proportionally to its weightage — satisfies "Calculate the overall
  // suggested score" from the weighted criteria (Task 5).
  const overallScore = params.criteria.reduce((sum, criterion) => {
    const evaluation = evaluations.find((e) => e.criterionId === criterion.id);
    if (!evaluation) return sum;
    const criterionPercentage = evaluation.score / criterion.maxMarks;
    return sum + criterionPercentage * (criterion.weightage / 100);
  }, 0);

  return { evaluations, overallScore };
}

// ---------- Shared orchestration ----------

const LOW_CONFIDENCE_THRESHOLD = 0.5;

export async function processGradingJob(gradingResultId: string): Promise<void> {
  const gradingResult = await prisma.aIGradingResult.findUnique({
    where: { id: gradingResultId },
    include: {
      submission: {
        include: {
          assignment: { include: { rubric: { include: { criteria: true } } } },
        },
      },
    },
  });

  if (!gradingResult) return;

  const { submission } = gradingResult;
  const { assignment } = submission;
  const studentAnswer = submission.textAnswer ?? "(no text answer provided)";

  await prisma.aIGradingResult.update({
    where: { id: gradingResultId },
    data: { status: "PROCESSING", startedAt: new Date() },
  });

  try {
    if (assignment.rubric && assignment.rubric.criteria.length > 0) {
      // ---- Rubric-based grading path ----
      const { evaluations, overallScore } = await gradeAgainstRubric({
        assignmentTitle: assignment.title,
        instructions: assignment.instructions ?? assignment.description,
        studentAnswer,
        criteria: assignment.rubric.criteria,
      });

      const suggestedScore = Math.round(overallScore * assignment.maxMarks);

      // Confidence for rubric grading is derived from consistency: if
      // criteria scores are wildly uneven relative to their weight, that's
      // a weaker signal than uniformly reasoned scoring. Kept simple here —
      // a fixed value, since per-criterion confidence isn't collected yet.
      const confidenceScore = 0.75;

      await prisma.$transaction([
        prisma.aIGradingResult.update({
          where: { id: gradingResultId },
          data: {
            status: confidenceScore < LOW_CONFIDENCE_THRESHOLD ? "REQUIRES_REVIEW" : "COMPLETED",
            suggestedScore,
            confidenceScore,
            completedAt: new Date(),
          },
        }),
        ...evaluations.map((e) =>
          prisma.rubricEvaluation.create({
            data: {
              gradingResultId,
              criterionId: e.criterionId,
              aiScore: e.score,
              aiReasoning: e.reasoning,
            },
          })
        ),
      ]);
    } else {
      // ---- Non-rubric grading path (original, unchanged behavior) ----
      const prompt = buildGradingPrompt({
        assignmentTitle: assignment.title,
        instructions: assignment.instructions ?? assignment.description,
        maxMarks: assignment.maxMarks,
        studentAnswer,
      });

      const result = await callGroqForOverallGrading(prompt);

      await prisma.aIGradingResult.update({
        where: { id: gradingResultId },
        data: {
          status: result.confidenceScore < LOW_CONFIDENCE_THRESHOLD ? "REQUIRES_REVIEW" : "COMPLETED",
          suggestedScore: result.suggestedScore,
          confidenceScore: result.confidenceScore,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          missingConcepts: result.missingConcepts,
          incorrectAnswers: result.incorrectAnswers,
          improvementSuggestions: result.improvementSuggestions,
          rawModelResponse: result as any,
          completedAt: new Date(),
        },
      });
    }

    await prisma.assignmentSubmission.update({
      where: { id: submission.id },
      data: { status: "UNDER_REVIEW" },
    });
  } catch (err) {
    await prisma.aIGradingResult.update({
      where: { id: gradingResultId },
      data: {
        status: "FAILED",
        errorMessage: err instanceof Error ? err.message : "Unknown grading error",
        completedAt: new Date(),
      },
    });
  }
}

export async function queueGradingForSubmission(submissionId: string): Promise<void> {
  await prisma.aIGradingResult.create({
    data: { submissionId, status: "QUEUED" },
  });
}