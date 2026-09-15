import { Router } from "express";
import * as rubricController from "../controllers/rubric.controller";

const router = Router();

router.post("/", rubricController.create);
router.get("/creator/:createdById", rubricController.list);
router.get("/:id", rubricController.getById);
router.patch("/assignment/:assignmentId/attach", rubricController.attach);

export default router;