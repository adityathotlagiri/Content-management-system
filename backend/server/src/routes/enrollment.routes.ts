import { Router } from "express";
import * as enrollmentController from "../controllers/enrollment.controller";

const router = Router();

router.post("/", enrollmentController.enroll);
router.get("/course/:courseId", enrollmentController.listForCourse);

export default router;