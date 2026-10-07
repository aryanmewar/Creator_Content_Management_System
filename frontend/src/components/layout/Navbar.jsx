import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, Menu, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { useNotification } from "../../hooks/useNotification.js";
import { getRealDate } from "../../utils/dateUtils.js";
import { Button } from "@/components/ui/button";

const pageTitles = {
  "/": "Dashboard",
  "/instructors": "Contributors",
  "/content": "Owners Content",
  "/assign-content": "Contributors Content",
  "/schedule": "Schedule",
  "/reports": "Reports & Analytics",
  "/future-projects": "Future Projects",
  "/settings": "Settings",
  "/my-dashboard": "My Dashboard",
  "/my-report": "My Performance Report",
};

const pageSubtitles = {
  "/": "Overview of your content pipeline",
  "/instructors": "Manage contributor profiles and assignments",
  "/content": "Create, manage, and track all content",
  "/assign-content":
    "Track and manage content assigned to additional contributors",
  "/schedule": "Schedule content across platforms",
  "/reports": "Content performance overview",
  "/future-projects": "Save links and ideas for your upcoming content",
  "/settings": "Manage your account and preferences",
  "/my-dashboard": "View your assigned content and tasks",
  "/my-report": "Track your completed content and on-time rate",
};

const Navbar = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useNotification();
  const title = pageTitles[location.pathname] || "Content Manager";
  const subtitle = pageSubtitles[location.pathname];

  // Live real-time synchronized with server world time
  const [currentTime, setCurrentTime] = useState(() => getRealDate());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getRealDate());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-3 sm:px-6 justify-between sticky top-0 z-20">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-slate-500 shrink-0"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight truncate max-w-[120px] sm:max-w-none">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 hidden sm:block truncate">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
        {/* Live Date & Real-Time Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-50/90 hover:bg-slate-100/90 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-slate-200 text-slate-700 shadow-sm transition-all text-xs">
          <div className="flex items-center gap-1 text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Calendar className="w-3.5 h-3.5 text-slate-400 hidden sm:block ml-0.5" />
          </div>

          {/* Date */}
          <span className="font-semibold text-slate-800 tracking-tight whitespace-nowrap">
            <span className="hidden md:inline">{format(currentTime, "EEE, ")}</span>
            {format(currentTime, "dd MMM yyyy")}
          </span>

          <span className="text-slate-300 font-bold">•</span>

          {/* Real-Time Live Clock */}
          <div className="flex items-center gap-1 text-[#2D4396] font-bold tabular-nums whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-[#2D4396]" />
            <span>{format(currentTime, "hh:mm:ss a")}</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full text-slate-500 relative bg-white hover:bg-slate-50 transition-transform hover:scale-105 hover:text-slate-700 shadow-sm"
          onClick={() => navigate("/notifications")}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold px-1.5 min-w-[20px] h-[20px] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
