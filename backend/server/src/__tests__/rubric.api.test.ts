import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import rubricRoutes from "../routes/rubric.routes";
import { errorHandler } from "../middleware/errorHandler";

const app = express();
app.use(express.json());
app.use("/api/rubrics", rubricRoutes);
app.use(errorHandler);

describe("Rubric API", () => {
  it("rejects a rubric whose criteria don't sum to 100", async () => {
    const res = await request(app)
      .post("/api/rubrics")
      .send({
        title: "Bad Rubric",
        createdById: "user-1",
        criteria: [
          { title: "A", weightage: 40, maxMarks: 10, order: 1 },
          { title: "B", weightage: 50, maxMarks: 10, order: 2 },
        ],
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/sum to 100/);
  });

  it("accepts a rubric whose criteria sum to exactly 100", async () => {
    const res = await request(app)
      .post("/api/rubrics")
      .send({
        title: "Good Rubric",
        createdById: "user-1",
        criteria: [
          { title: "A", weightage: 40, maxMarks: 10, order: 1 },
          { title: "B", weightage: 60, maxMarks: 10, order: 2 },
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.criteria).toHaveLength(2);
  });
});