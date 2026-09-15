import { Request, Response, NextFunction } from "express";
import * as notificationService from "../services/notification.service";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const unreadOnly = req.query.unreadOnly === "true";
    const notifications = await notificationService.listNotifications(
      req.params.userId as string,
      unreadOnly
    );
    res.json(notifications);
  } catch (err) {
    next(err);
  }
}

export async function unreadCount(req: Request, res: Response, next: NextFunction) {
  try {
    const count = await notificationService.getUnreadCount(req.params.userId as string);
    res.json({ count });
  } catch (err) {
    next(err);
  }
}

export async function markRead(req: Request, res: Response, next: NextFunction) {
  try {
    const updated = await notificationService.markAsRead(req.params.id as string);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction) {
  try {
    await notificationService.markAllAsRead(req.params.userId as string);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}