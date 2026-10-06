import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { notificationService } from "../services/notificationService.js";
import useAuth from "../hooks/useAuth.js";

const NotificationContext = createContext();

export const useNotification = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const seenIdsRef = useRef(new Set());
  const isInitialLoadRef = useRef(true);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const data = await notificationService.getNotifications();
      const freshList = data || [];

      setNotifications((prev) => {
        // Find newly arrived unread notifications
        const newlyArrived = freshList.filter(
          (n) => !n.isRead && !seenIdsRef.current.has(n._id)
        );

        // On subsequent polls, trigger toast alerts for newly arrived unread notifications
        if (!isInitialLoadRef.current && newlyArrived.length > 0) {
          newlyArrived.forEach((n) => {
            seenIdsRef.current.add(n._id);
            if (n.title.includes("Schedule") || n.title.includes("Posting Time") || n.title.includes("⏰")) {
              toast(
                (t) => (
                  <div className="flex flex-col gap-1 max-w-sm">
                    <span className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                      {n.title}
                    </span>
                    <span className="text-xs text-amber-800 leading-snug">{n.message}</span>
                  </div>
                ),
                {
                  duration: 10000,
                  style: {
                    borderRadius: "16px",
                    background: "#FFFBEB",
                    color: "#92400E",
                    border: "1px solid #FCD34D",
                    padding: "12px 16px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  },
                }
              );
            } else {
              toast(n.message, { icon: "🔔", duration: 5000 });
            }
          });
        } else if (isInitialLoadRef.current) {
          // Record initial notifications into seenIds
          freshList.forEach((n) => seenIdsRef.current.add(n._id));
          isInitialLoadRef.current = false;
        }

        return freshList;
      });

      setUnreadCount(freshList.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  useEffect(() => {
    isInitialLoadRef.current = true;
    seenIdsRef.current.clear();
    loadNotifications();
    // Poll for notifications every 10 seconds for real-time alerts
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadNotifications();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => {
        const deleted = prev.find((n) => n._id === id);
        if (deleted && !deleted.isRead) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n._id !== id);
      });
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  const clearAll = async () => {
    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to clear notifications", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        loadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
