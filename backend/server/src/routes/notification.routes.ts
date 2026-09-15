import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";

const router = Router();

router.get("/:userId", notificationController.list);
router.get("/:userId/unread-count", notificationController.unreadCount);
router.patch("/:id/read", notificationController.markRead);
router.patch("/:userId/read-all", notificationController.markAllRead);

export default router;