import { Router } from "express";
import * as feedbackController from "../controllers/feedback.controller";

const router = Router();

router.post("/:submissionId/generate", feedbackController.generate);
router.get("/:submissionId", feedbackController.getBySubmission);
router.patch("/:submissionId", feedbackController.update);
router.patch("/:submissionId/approve", feedbackController.approve);
router.patch("/:submissionId/publish", feedbackController.publish);

export default router;