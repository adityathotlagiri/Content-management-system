import { Router } from "express";
import * as analyticsController from "../controllers/analytics.controller";

const router = Router();
router.get("/assignment/:assignmentId", analyticsController.getAssignmentAnalytics);

export default router;