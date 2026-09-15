import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Notification, NotificationType } from "../../../types/homework";
import { useNotifications } from "../../../hooks/useNotifications";

// TODO: replace with the actual logged-in user's id once real auth exists
const CURRENT_USER_ID = "user-1";

const TYPE_ICON: Record<NotificationType, string> = {
  ASSIGNMENT_PUBLISHED: "📢",
  DEADLINE_APPROACHING: "⏰",
  DUE_TODAY: "⏰",
  OVERDUE: "⚠️",
  SUBMISSION_SUCCESSFUL: "✅",
  GRADE_PUBLISHED: "🎓",
  FEEDBACK_AVAILABLE: "💬",
  RESUBMISSION_REQUESTED: "🔁",
  DEADLINE_EXTENDED: "📅",
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationBell() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(CURRENT_USER_ID);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClick = (notification: Notification) => {
    if (!notification.isRead) markRead(notification.id);
    setIsOpen(false);
    if (notification.submissionId) {
      navigate(`/homework/review/${notification.submissionId}`);
    } else if (notification.assignmentId) {
      navigate(`/homework/assignments/${notification.assignmentId}/submissions`);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-medium flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto bg-white rounded-xl border border-gray-200 shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h4 className="text-sm font-medium text-gray-900">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-[#238B45] hover:text-[#036724]"
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No notifications yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex gap-2.5 ${
                    !n.isRead ? "bg-[#238B45]/5" : ""
                  }`}
                >
                  <span className="text-base shrink-0">{TYPE_ICON[n.type]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <span className="shrink-0 w-2 h-2 rounded-full bg-[#238B45] mt-1.5" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}