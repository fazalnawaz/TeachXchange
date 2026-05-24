import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import {
  getNotifications,
  markAllNotificationsRead,
  getUnreadCount,
} from "../services/notificationService";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ]);
      setNotifications(listRes.data.data || []);
      setUnreadCount(countRes.data.count || 0);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 45000);
    const onRefresh = () => load();
    window.addEventListener("notifications:refresh", onRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("notifications:refresh", onRefresh);
    };
  }, [load]);

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    load();
  };

  const messagesNavState = (n) => {
    if (n.type === "chat_message" && n.meta?.conversationId) {
      return {
        conversationId: n.meta.conversationId,
        partnerId: n.meta.senderId,
      };
    }
    if (n.type === "connection_accepted" && n.meta?.partnerId) {
      return {
        conversationId: n.meta.conversationId,
        partnerId: n.meta.partnerId,
      };
    }
    return null;
  };

  const chatLink = (n) => {
    if (messagesNavState(n)) return "/messages";
    if (n.type?.startsWith("session_")) return "/sessions";
    return null;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 mt-2 w-80 z-50 glass-card rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-xs text-purple-600 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-gray-500 text-center">No notifications</p>
              ) : (
                notifications.map((n) => {
                  const href = chatLink(n);
                  const navState = messagesNavState(n);
                  const inner = (
                    <>
                      <p className="font-medium text-gray-900 dark:text-white">{n.title}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{n.message}</p>
                    </>
                  );
                  return href ? (
                    <Link
                      key={n._id}
                      to={href}
                      state={navState || undefined}
                      onClick={() => setOpen(false)}
                      className={`block px-4 py-3 border-b border-gray-50 dark:border-gray-800 text-sm hover:bg-purple-50/50 ${
                        !n.read ? "bg-purple-50/50 dark:bg-purple-900/20" : ""
                      }`}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div
                      key={n._id}
                      className={`px-4 py-3 border-b border-gray-50 dark:border-gray-800 text-sm ${
                        !n.read ? "bg-purple-50/50 dark:bg-purple-900/20" : ""
                      }`}
                    >
                      {inner}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
