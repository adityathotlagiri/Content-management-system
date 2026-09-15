import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller";

const router = Router();

router.get("/teacher/:teacherId", dashboardController.getTeacherDashboard);
router.get("/student/:studentId", dashboardController.getStudentDashboard);
export default router;