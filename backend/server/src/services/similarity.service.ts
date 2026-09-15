import { prisma } from "../lib/prisma";

// Simple Jaccard-similarity over word shingles — no external service
// dependency, good enough to flag near-duplicate text answers.
function similarity(textA: string, textB: string): number {
  const shingles = (text: string) => {
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    const set = new Set<string>();
    for (let i = 0; i < words.length - 2; i++) set.add(words.slice(i, i + 3).join(" "));
    return set;
  };

  const setA = shingles(textA);
  const setB = shingles(textB);
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const s of setA) if (setB.has(s)) intersection++;
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

const FLAG_THRESHOLD = 0.6;

export async function runSimilarityCheck(assignmentId: string) {
  const submissions = await prisma.assignmentSubmission.findMany({
    where: { assignmentId, textAnswer: { not: null } },
    select: { id: true, textAnswer: true },
  });

  const flags = [];
  for (let i = 0; i < submissions.length; i++) {
    for (let j = i + 1; j < submissions.length; j++) {
      const score = similarity(submissions[i].textAnswer!, submissions[j].textAnswer!);
      if (score >= FLAG_THRESHOLD) {
        const flag = await prisma.similarityFlag.create({
          data: {
            assignmentId,
            submissionAId: submissions[i].id,
            submissionBId: submissions[j].id,
            similarityPercent: Math.round(score * 100),
          },
        });
        flags.push(flag);
      }
    }
  }
  return flags;
}

export async function listFlags(assignmentId: string) {
  return prisma.similarityFlag.findMany({ where: { assignmentId }, orderBy: { similarityPercent: "desc" } });
}

export async function dismissFlag(flagId: string) {
  return prisma.similarityFlag.update({ where: { id: flagId }, data: { status: "DISMISSED" } });
}   