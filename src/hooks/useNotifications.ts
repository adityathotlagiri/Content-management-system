/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import type { Notification } from "../types/homework";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../data/notificationsApi";

const POLL_INTERVAL_MS = 30000; // check for new notifications every 30s

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    const [list, count] = await Promise.all([
      fetchNotifications(userId),
      fetchUnreadCount(userId),
    ]);
    setNotifications(list);
    setUnreadCount(count);
  }, [userId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  const markRead = useCallback(
    async (notificationId: string) => {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    []
  );

  const markAllRead = useCallback(async () => {
    await markAllNotificationsAsRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, [userId]);

  return { notifications, unreadCount, markRead, markAllRead };
}