import { Request, Response, NextFunction } from "express";
import * as similarityService from "../services/similarity.service";

export async function run(req: Request, res: Response, next: NextFunction) {
  try {
    const flags = await similarityService.runSimilarityCheck(req.params.assignmentId as string);
    res.json(flags);
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const flags = await similarityService.listFlags(req.params.assignmentId as string);
    res.json(flags);
  } catch (err) {
    next(err);
  }
}

export async function dismiss(req: Request, res: Response, next: NextFunction) {
  try {
    const flag = await similarityService.dismissFlag(req.params.flagId as string);
    res.json(flag);
  } catch (err) {
    next(err);
  }
}