// server/src/routes/submissions.routes.ts
import { Router } from "express";
import * as submissionsController from "../controllers/submissions.controller";
import { validateSubmissionUpload } from "../middleware/validateSubmission";

const router = Router();

router.post("/", validateSubmissionUpload, submissionsController.submitAssignment);
router.get("/assignment/:assignmentId", submissionsController.listForAssignment);
router.get("/student/:studentId", submissionsController.getStudentSubmissions);
router.get("/:id", submissionsController.getById);
router.patch("/:id/request-resubmission", submissionsController.requestResubmission);
router.patch("/:id/finalize-grade", submissionsController.finalizeGrade);
export default router;