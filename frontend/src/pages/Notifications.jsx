import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import { useNotification } from "../context/NotificationContext.jsx";
import {
  Bell,
  Trash2,
  CheckCircle,
  Info,
  AlertTriangle,
  AlertCircle,
  Trash,
  ChevronLeft,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotification();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:shadow-sm transition-all"
              title="Go Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                Notifications
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Stay updated with your latest assignments and content status.
              </p>
            </div>
          </div>
          {notifications.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm font-medium rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
              >
                Mark all as read
              </button>
              <button
                onClick={clearAll}
                className="px-4 py-2 text-sm font-medium rounded-xl text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 hover:border-rose-200 transition-all shadow-sm flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 text-center border border-slate-200/60 shadow-sm flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center mb-5 shadow-inner border border-slate-100">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              All Caught Up!
            </h3>
            <p className="text-sm text-slate-500 max-w-sm">
              You don't have any new notifications right now. When you do,
              they'll show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => {
              const isUnread = !notif.isRead;
              return (
                <div
                  key={notif._id}
                  className={`group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ${
                    isUnread
                      ? "bg-white shadow-md border border-primary/20 hover:shadow-lg hover:-translate-y-0.5"
                      : "bg-slate-50/80 border border-slate-200 opacity-80 hover:opacity-100"
                  }`}
                >
                  {/* Left accent border for unread */}
                  {isUnread && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-blue-400" />
                  )}

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      <div
                        className={`p-2.5 rounded-xl ${isUnread ? "bg-primary/10" : "bg-slate-200/50"}`}
                      >
                        {getIcon(notif.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1.5">
                        <h4
                          className={`text-base font-bold truncate ${
                            isUnread ? "text-slate-900" : "text-slate-700"
                          }`}
                        >
                          {notif.title}
                        </h4>
                        <span className="text-xs font-medium text-slate-400 whitespace-nowrap ml-4 bg-slate-100 px-2.5 py-1 rounded-full">
                          {formatDistanceToNow(new Date(notif.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-4 leading-relaxed max-w-3xl">
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-3">
                        {isUnread && (
                          <button
                            onClick={() => markAsRead(notif._id)}
                            className="text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Mark as read
                          </button>
                        )}
                        {notif.link && (
                          <a
                            href={notif.link}
                            className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <Info className="w-3.5 h-3.5" />
                            View Details
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex items-start ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => deleteNotification(notif._id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete notification"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
