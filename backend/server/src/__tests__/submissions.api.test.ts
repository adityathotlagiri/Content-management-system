import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import express from "express";
import assignmentsRoutes from "../routes/assignments.routes";
import submissionsRoutes from "../routes/submissions.routes";
import { errorHandler } from "../middleware/errorHandler";
import { prisma } from "../lib/prisma";

const app = express();
app.use(express.json());
app.use("/api/assignments", assignmentsRoutes);
app.use("/api/submissions", submissionsRoutes);
app.use(errorHandler);

let assignmentId: string;

describe("Submissions API", () => {
  beforeAll(async () => {
    const created = await prisma.assignment.create({
      data: {
        title: "Submission Test Assignment",
        description: "desc",
        courseId: "course-1",
        courseName: "Test Course",
        assignmentType: "TEXT",
        difficultyLevel: "EASY",
        maxMarks: 100,
        passingMarks: 40,
        startDate: new Date("2026-01-01T00:00:00Z"),
        submissionDeadline: new Date("2099-01-01T00:00:00Z"), // far future — never late
        allowedFileTypes: [],
        maxFileSizeMb: 10,
        createdById: "user-1",
        status: "PUBLISHED",
        maxSubmissionAttempts: 1,
      },
    });
    assignmentId = created.id;
  });

  afterAll(async () => {
    await prisma.assignmentSubmission.deleteMany({ where: { assignmentId } });
    await prisma.assignment.delete({ where: { id: assignmentId } });
    await prisma.$disconnect();
  });

  it("rejects submission to an unpublished/nonexistent assignment", async () => {
    const res = await request(app)
      .post("/api/submissions")
      .send({ assignmentId: "nonexistent", studentId: "student-1", textAnswer: "hi" });
    expect(res.status).toBe(400);
  });

  it("accepts a valid submission and marks it not late", async () => {
    const res = await request(app)
      .post("/api/submissions")
      .send({ assignmentId, studentId: "student-1", textAnswer: "My answer" });
    expect(res.status).toBe(201);
    expect(res.body.isLate).toBe(false);
    expect(res.body.status).toBe("SUBMITTED");
  });

  it("rejects a second submission once maxSubmissionAttempts is reached", async () => {
    const res = await request(app)
      .post("/api/submissions")
      .send({ assignmentId, studentId: "student-1", textAnswer: "Second try" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Maximum submission attempts/);
  });

  it("allows a different student to submit independently", async () => {
    const res = await request(app)
      .post("/api/submissions")
      .send({ assignmentId, studentId: "student-2", textAnswer: "Another answer" });
    expect(res.status).toBe(201);
  });
});