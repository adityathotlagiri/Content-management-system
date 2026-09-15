import { Router } from "express";
import * as lateController from "../controllers/lateSubmission.controller";

const router = Router();

router.post("/:submissionId/calculate-penalty", lateController.calculatePenalty);
router.patch("/:submissionId/waive-penalty", lateController.waivePenalty);
router.post("/extensions", lateController.grantExtension);
router.patch("/:submissionId/accept-late", lateController.accept);
router.patch("/:submissionId/reject-late", lateController.reject);

export default router;