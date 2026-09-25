import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, Menu, Calendar } from "lucide-react";
import { useNotification } from "../../context/NotificationContext.jsx";
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
};

const Navbar = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useNotification();
  const title = pageTitles[location.pathname] || "Content Manager";
  const subtitle = pageSubtitles[location.pathname];

  const now = new Date();
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-slate-500"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight truncate max-w-[200px] sm:max-w-none">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Date Pill */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50/80 hover:bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200 text-slate-600 transition-all">
          <Calendar className="w-4 h-4 text-slate-400" />
          <p className="text-xs font-medium tracking-wide">
            {now.toLocaleDateString("en-US", {
              weekday: "short",
              month: "long",
              day: "numeric",
            })}
          </p>
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
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
