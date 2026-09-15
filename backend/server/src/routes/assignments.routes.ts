// server/src/routes/assignments.routes.ts
import { Router } from "express";
import * as assignmentsController from "../controllers/assignments.controller";
import { validateCreateAssignment } from "../middleware/validate";

const router = Router();

router.post("/", validateCreateAssignment, assignmentsController.createAssignment);
router.get("/", assignmentsController.listAssignments);
router.get("/:id", assignmentsController.getAssignmentById);
router.patch("/:id/status", assignmentsController.updateStatus);
router.post("/:id/duplicate", assignmentsController.duplicateAssignment);
router.post("/:id/archive", assignmentsController.archiveAssignment);

export default router;