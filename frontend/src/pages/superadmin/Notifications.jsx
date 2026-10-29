import  { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import notificationService from "../../services/notificationService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function SuperAdminNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getAll();
      if (res?.success) {
        setNotifications(res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      toast.success("All marked as read");
      fetchNotifs();
    } catch (err) {
      toast.error(err,"Failed to mark read");
    }
  };

  const handleClick = async (n) => {
    if (!n.is_read) {
      await notificationService.markAsRead(n.id);
    }
    if (n.link) {
      navigate(n.link);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Bell className="text-purple-600 dark:text-purple-400" size={26} />
            Notifications & System Alerts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time platform activity alerts, subscription upgrades, and support ticket notifications.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <CheckCircle2 size={15} /> Mark All as Read
        </button>
      </div>

      {/* NOTIFICATIONS LIST */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/20">
          <Bell className="h-12 w-12 text-slate-400 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">All caught up!</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            There are no new platform notifications at this time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className={`flex items-start justify-between gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                n.is_read
                  ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400"
                  : "border-purple-200 dark:border-purple-500/30 bg-purple-50/50 dark:bg-purple-500/5 text-slate-900 dark:text-white shadow-xs"
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Bell size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold">{n.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-2">
                    <Clock size={11} /> {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {n.link && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 shrink-0">
                  Open <ExternalLink size={13} />
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
