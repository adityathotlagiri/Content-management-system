import { Router } from "express";
import * as gradingController from "../controllers/grading.controller";

const router = Router();

router.get("/submission/:submissionId", gradingController.getGradingResultBySubmission);
router.get("/:gradingResultId/rubric-evaluations", gradingController.getRubricEvaluations);
router.patch("/rubric-evaluation/override", gradingController.overrideCriterionScore);
export default router;