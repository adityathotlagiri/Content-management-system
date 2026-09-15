/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from "express";
import * as lateService from "../services/lateSubmission.service";

export async function calculatePenalty(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await lateService.calculateLatePenalty(req.params.submissionId as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function waivePenalty(req: Request, res: Response, next: NextFunction) {
  try {
    const { teacherId } = req.body;
    const result = await lateService.waivePenalty(req.params.submissionId as string, teacherId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function grantExtension(req: Request, res: Response, next: NextFunction) {
  try {
    const extension = await lateService.grantExtension(req.body);
    res.status(201).json(extension);
  } catch (err) {
    next(err);
  }
}

export async function accept(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await lateService.acceptLateSubmission(req.params.submissionId as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function reject(req: Request, res: Response, next: NextFunction) {
  try {
    const { teacherId } = req.body;
    const result = await lateService.rejectLateSubmission(req.params.submissionId as string, teacherId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}