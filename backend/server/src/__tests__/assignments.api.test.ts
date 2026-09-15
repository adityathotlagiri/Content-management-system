import { describe, it, expect,  afterAll } from "vitest";
import request from "supertest";
import express from "express";
import assignmentsRoutes from "../routes/assignments.routes";
import { errorHandler } from "../middleware/errorHandler";
import { prisma } from "../lib/prisma";

const app = express();
app.use(express.json());
app.use("/api/assignments", assignmentsRoutes);
app.use(errorHandler);

let createdId: string;

describe("Assignments API", () => {
  afterAll(async () => {
    if (createdId) await prisma.assignment.delete({ where: { id: createdId } }).catch(() => {});
    await prisma.$disconnect();
  });

  it("rejects creation with missing required fields", async () => {
    const res = await request(app).post("/api/assignments").send({ title: "Incomplete" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Missing required fields/);
  });

  it("rejects creation when passingMarks exceeds maxMarks", async () => {
    const res = await request(app)
      .post("/api/assignments")
      .send({
        title: "Bad marks",
        description: "desc",
        courseId: "course-1",
        courseName: "Test Course",
        assignmentType: "TEXT",
        difficultyLevel: "EASY",
        maxMarks: 50,
        passingMarks: 60,
        startDate: "2026-01-01T00:00:00Z",
        submissionDeadline: "2026-01-05T00:00:00Z",
        allowedFileTypes: [],
        maxFileSizeMb: 10,
        createdById: "user-1",
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/passingMarks/);
  });

  it("creates an assignment with valid data, defaulting to DRAFT", async () => {
    const res = await request(app)
      .post("/api/assignments")
      .send({
        title: "Test Suite Assignment",
        description: "desc",
        courseId: "course-1",
        courseName: "Test Course",
        assignmentType: "TEXT",
        difficultyLevel: "EASY",
        maxMarks: 100,
        passingMarks: 40,
        startDate: "2026-01-01T00:00:00Z",
        submissionDeadline: "2026-01-05T00:00:00Z",
        allowedFileTypes: [],
        maxFileSizeMb: 10,
        createdById: "user-1",
      });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("DRAFT");
    createdId = res.body.id;
  });

  it("lists assignments with pagination metadata", async () => {
    const res = await request(app).get("/api/assignments?page=1&pageSize=5");
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty("total");
    expect(Array.isArray(res.body.assignments)).toBe(true);
  });

  it("returns 404 for a non-existent assignment id", async () => {
    const res = await request(app).get("/api/assignments/nonexistent-id");
    expect(res.status).toBe(404);
  });
});