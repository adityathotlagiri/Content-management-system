import { Request, Response, NextFunction } from "express";
import * as feedbackService from "../services/feedback.service";

export async function generate(req: Request, res: Response, next: NextFunction) {
  try {
    await feedbackService.generateFeedback(req.params.submissionId as string);
    const feedback = await feedbackService.getFeedbackBySubmission(req.params.submissionId as string);
    res.status(201).json(feedback);
  } catch (err) {
    if (err instanceof Error) return res.status(400).json({ error: err.message });
    next(err);
  }
}

export async function getBySubmission(req: Request, res: Response, next: NextFunction) {
  try {
    const feedback = await feedbackService.getFeedbackBySubmission(req.params.submissionId as string);
    if (!feedback) return res.status(404).json({ error: "No feedback generated yet" });
    res.json(feedback);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const feedback = await feedbackService.updateFeedback(req.params.submissionId as string, req.body);
    res.json(feedback);
  } catch (err) {
    next(err);
  }
}

export async function approve(req: Request, res: Response, next: NextFunction) {
  try {
    const { teacherId } = req.body;
    const feedback = await feedbackService.approveFeedback(req.params.submissionId as string, teacherId);
    res.json(feedback);
  } catch (err) {
    next(err);
  }
}

export async function publish(req: Request, res: Response, next: NextFunction) {
  try {
    const feedback = await feedbackService.publishFeedback(req.params.submissionId as string);
    res.json(feedback);
  } catch (err) {
    next(err);
  }
}