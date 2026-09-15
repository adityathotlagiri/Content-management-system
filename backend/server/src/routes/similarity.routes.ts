import { Router } from "express";
import * as similarityController from "../controllers/similarity.controller";

const router = Router();
router.post("/:assignmentId/run", similarityController.run);
router.get("/:assignmentId", similarityController.list);
router.patch("/flag/:flagId/dismiss", similarityController.dismiss);

export default router;