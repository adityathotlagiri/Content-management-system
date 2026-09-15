import Groq from "groq-sdk";
import { prisma } from "../lib/prisma";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface FeedbackContent {
  overallComments: string;
  whatWentWell: string[];
  areasForImprovement: string[];
  specificMistakes: string[];
  recommendedNextSteps: string[];
  suggestedResources: string[];
}

function buildFeedbackPrompt(params: {
  assignmentTitle: string;
  instructions: string;
  studentAnswer: string;
  suggestedScore: number;
  maxMarks: number;
}): string {
  return `You are writing personalized, encouraging feedback for a student's assignment submission. Return ONLY valid JSON, no other text.

Assignment: ${params.assignmentTitle}
Instructions: ${params.instructions}
Score: ${params.suggestedScore} / ${params.maxMarks}

Student's submission:
"""
${params.studentAnswer}
"""

Write feedback that is constructive and specific, not generic. Return JSON in exactly this shape:
{
  "overallComments": "<2-3 sentence overall summary, encouraging but honest>",
  "whatWentWell": [<short strings, specific things done well>],
  "areasForImprovement": [<short strings, specific areas to improve>],
  "specificMistakes": [<short strings, concrete mistakes found, empty array if none>],
  "recommendedNextSteps": [<short strings, actionable next steps>],
  "suggestedResources": [<short strings, e.g. "Review chapter 4 on recursion" \u2014 empty array if nothing specific applies>]
}`;
}

async function callGroqForFeedback(prompt: string): Promise<FeedbackContent> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4, // slightly higher than grading — feedback benefits from more natural phrasing
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty response from feedback model");
  const parsed = JSON.parse(raw);

  return {
    overallComments: typeof parsed.overallComments === "string" ? parsed.overallComments : "",
    whatWentWell: Array.isArray(parsed.whatWentWell) ? parsed.whatWentWell : [],
    areasForImprovement: Array.isArray(parsed.areasForImprovement) ? parsed.areasForImprovement : [],
    specificMistakes: Array.isArray(parsed.specificMistakes) ? parsed.specificMistakes : [],
    recommendedNextSteps: Array.isArray(parsed.recommendedNextSteps) ? parsed.recommendedNextSteps : [],
    suggestedResources: Array.isArray(parsed.suggestedResources) ? parsed.suggestedResources : [],
  };
}

export async function generateFeedback(submissionId: string): Promise<void> {
  const submission = await prisma.assignmentSubmission.findUnique({
    where: { id: submissionId },
    include: { assignment: true, aiGradingResult: true },
  });
  if (!submission) throw new Error("Submission not found");

  const content = await callGroqForFeedback(
    buildFeedbackPrompt({
      assignmentTitle: submission.assignment.title,
      instructions: submission.assignment.instructions ?? submission.assignment.description,
      studentAnswer: submission.textAnswer ?? "(no text answer provided)",
      suggestedScore: submission.aiGradingResult?.suggestedScore ?? 0,
      maxMarks: submission.assignment.maxMarks,
    })
  );

  await prisma.feedback.upsert({
    where: { submissionId },
    update: {
      ...content,
      status: "DRAFT", // regenerating resets to draft — a previously approved/published
                        // feedback shouldn't silently stay "approved" with new content
      regeneratedCount: { increment: 1 },
      generatedAt: new Date(),
    },
    create: { submissionId, ...content, status: "DRAFT" },
  });
}

export async function getFeedbackBySubmission(submissionId: string) {
  return prisma.feedback.findUnique({ where: { submissionId } });
}

export async function updateFeedback(
  submissionId: string,
  updates: Partial<FeedbackContent> & { teacherComments?: string }
) {
  return prisma.feedback.update({ where: { submissionId }, data: updates });
}

export async function approveFeedback(submissionId: string, teacherId: string) {
  return prisma.feedback.update({
    where: { submissionId },
    data: { status: "APPROVED", approvedById: teacherId, approvedAt: new Date() },
  });
}

export async function publishFeedback(submissionId: string) {
  const feedback = await prisma.feedback.update({
    where: { submissionId },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });

  await prisma.notification.create({
    data: {
      userId: (await prisma.assignmentSubmission.findUnique({ where: { id: submissionId } }))!.studentId,
      type: "FEEDBACK_AVAILABLE",
      title: "Feedback available",
      message: "Your teacher has published feedback on your submission.",
      submissionId,
    },
  });

  return feedback;
}