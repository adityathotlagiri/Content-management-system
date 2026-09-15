import { prisma } from "../lib/prisma";
import { processGradingJob } from "../services/aiGrading.service";

const POLL_INTERVAL_MS = 5000;
let isProcessing = false; // prevents overlapping poll cycles

// Polls for QUEUED grading jobs and processes them one at a time.
// This uses the database itself as the queue rather than adding
// Redis/BullMQ — appropriate given no queue infrastructure exists yet,
// and volume here is nowhere near what would need true concurrency.
async function pollForJobs() {
  if (isProcessing) return; // Task 18: "Duplicate request prevention"
  isProcessing = true;

  try {
    const nextJob = await prisma.aIGradingResult.findFirst({
      where: { status: "QUEUED" },
      orderBy: { queuedAt: "asc" },
    });

    if (nextJob) {
      console.log(`[grading-queue] Processing job ${nextJob.id}`);
      await processGradingJob(nextJob.id);
    }
  } catch (err) {
    console.error("[grading-queue] Poll error:", err);
  } finally {
    isProcessing = false;
  }
}

export function startGradingQueueWorker() {
  console.log("[grading-queue] Worker started, polling every", POLL_INTERVAL_MS, "ms");
  setInterval(pollForJobs, POLL_INTERVAL_MS);
}