import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import { useNotification } from "../context/NotificationContext.jsx";
import { Bell, Trash2, CheckCircle, Info, AlertTriangle, AlertCircle, Trash } from "lucide-react";
import Button from "../components/common/Button.jsx";
import { formatDistanceToNow } from "date-fns";

const getIcon = (type) => {
  switch (type) {
    case "SUCCESS":
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case "WARNING":
      return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    case "ERROR":
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    case "INFO":
    default:
      return <Info className="w-5 h-5 text-blue-500" />;
  }
};

const Notifications = () => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotification();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary" />
              Notifications
            </h2>
            <p className="text-sm text-slate-500">
              Stay updated with your latest assignments and content status.
            </p>
          </div>
          {notifications.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={markAllAsRead}
                className="text-sm"
              >
                Mark all as read
              </Button>
              <Button
                variant="danger"
                onClick={clearAll}
                className="text-sm flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
            </div>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="card p-12 text-center border border-slate-100 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-1">
              No notifications yet
            </h3>
            <p className="text-sm text-slate-500">
              When you get notifications, they'll show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`card p-4 flex gap-4 transition-all duration-200 border ${notif.isRead ? "bg-white border-slate-100 opacity-70" : "bg-blue-50/30 border-blue-100 shadow-sm"}`}
              >
                <div className="flex-shrink-0 mt-1">{getIcon(notif.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4
                      className={`text-sm font-semibold truncate ${notif.isRead ? "text-slate-700" : "text-slate-900"}`}
                    >
                      {notif.title}
                    </h4>
                    <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                      {formatDistanceToNow(new Date(notif.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{notif.message}</p>
                  
                  <div className="flex items-center gap-3">
                    {!notif.isRead && (
                      <button
                        onClick={() => markAsRead(notif._id)}
                        className="text-xs font-medium text-primary hover:text-primary-700 transition-colors"
                      >
                        Mark as read
                      </button>
                    )}
                    {notif.link && (
                      <a
                        href={notif.link}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        View Details
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center ml-2">
                  <button
                    onClick={() => deleteNotification(notif._id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete notification"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
