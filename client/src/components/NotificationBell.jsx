import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { getNotifications, markAllNotificationsRead } from "../services/verificationService";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = async () => {
    try {
      const { data } = await getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    load();
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
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`px-4 py-3 border-b border-gray-50 dark:border-gray-800 text-sm ${
                      !n.read ? "bg-purple-50/50 dark:bg-purple-900/20" : ""
                    }`}
                  >
                    <p className="font-medium text-gray-900 dark:text-white">{n.title}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{n.message}</p>
                  </div>
                ))
              )}
            </div>
            <div className="flex border-t border-gray-100 dark:border-gray-700">
              <Link
                to="/browse"
                onClick={() => setOpen(false)}
                className="flex-1 text-center py-2.5 text-sm font-medium text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                Matches
              </Link>
              <Link
                to="/skill-verification"
                onClick={() => setOpen(false)}
                className="flex-1 text-center py-2.5 text-sm font-medium text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-l border-gray-100 dark:border-gray-700"
              >
                Verification
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
