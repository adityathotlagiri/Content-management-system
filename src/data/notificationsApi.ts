import type { Notification } from "../types/homework";

const API_BASE = "http://localhost:4000/api/notifications";

export async function fetchNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
  const query = unreadOnly ? "?unreadOnly=true" : "";
  const res = await fetch(`${API_BASE}/${userId}${query}`);
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export async function fetchUnreadCount(userId: string): Promise<number> {
  const res = await fetch(`${API_BASE}/${userId}/unread-count`);
  if (!res.ok) return 0;
  const data = await res.json();
  return data.count;
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await fetch(`${API_BASE}/${notificationId}/read`, { method: "PATCH" });
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await fetch(`${API_BASE}/${userId}/read-all`, { method: "PATCH" });
}