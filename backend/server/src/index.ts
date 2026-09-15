import "dotenv/config"; // MUST be the very first import — loads .env before anything else runs
import express from "express";
import cors from "cors";
import assignmentsRoutes from "./routes/assignments.routes";
import { errorHandler } from "./middleware/errorHandler";
import submissionsRoutes from "./routes/submissions.routes";
import { startGradingQueueWorker } from "./jobs/gradingQueue";
import gradingRoutes from "./routes/grading.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import enrollmentRoutes from "./routes/enrollment.routes";
import rubricRoutes from "./routes/rubric.routes";
import { startDeadlineReminderWorker } from "./jobs/deadlineReminders";
import notificationRoutes from "./routes/notification.routes";
import feedbackRoutes from "./routes/feedback.routes";
import analyticsRoutes from "./routes/analytics.routes";
import similarityRoutes from "./routes/similarity.routes";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

app.use("/api/assignments", assignmentsRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/submissions", submissionsRoutes);
app.use("/api/grading", gradingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use(errorHandler);
app.use("/api/rubrics", rubricRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use("/api/similarity", similarityRoutes);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startGradingQueueWorker(); 
  startDeadlineReminderWorker();
});