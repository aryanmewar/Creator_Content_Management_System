import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  UserPlus,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Zap,
  ChevronLeft,
  ChevronRight,
  X,
  Bookmark,
} from "lucide-react";
import useAuth from "../../hooks/useAuth.js";
import { getInitials } from "../../utils/formatUtils.js";
import { Button } from "@/components/ui/button";

const adminNavItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/instructors", icon: Users, label: "Contributors" },
  { to: "/content", icon: FileText, label: "Owners Content" },
  { to: "/assign-content", icon: UserPlus, label: "Contributors Content" },
  { to: "/schedule", icon: Calendar, label: "Schedule" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/future-projects", icon: Bookmark, label: "Future Projects" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const contributorNavItems = [
  { to: "/my-dashboard", icon: LayoutDashboard, label: "My Dashboard" },
  { to: "/my-report", icon: BarChart3, label: "My Report" },
];

const Sidebar = ({
  isCollapsed,
  setIsCollapsed,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const isVisualCollapsed = isCollapsed && !isMobileMenuOpen;

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems =
    user?.role === "CONTRIBUTOR" ? contributorNavItems : adminNavItems;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <aside
        className={`fixed left-0 top-0 h-[100dvh] bg-slate-900 flex flex-col z-50 transition-all duration-500 ease-out ${isVisualCollapsed ? "w-16" : "w-64"} ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Logo */}
        <div className="px-4 py-5 border-b border-white/10 flex items-center relative">
          <div
            className={`flex items-center gap-3 overflow-hidden transition-all duration-500 ease-out ${isVisualCollapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100"}`}
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm">
              <Zap className="w-5 h-5 text-white shrink-0" />
            </div>
            <div className="flex flex-col">
              <p className="text-white font-logo text-xl leading-tight truncate tracking-wide">
                Createlyt
              </p>
              <p className="text-slate-400 text-[10px] uppercase tracking-wider">
                Workspace
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden md:flex h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 absolute transition-all duration-500 ease-out ${isVisualCollapsed ? "left-1/2 -translate-x-1/2" : "right-4"}`}
            title={isVisualCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isVisualCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </Button>

          {/* Mobile Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden absolute right-4 h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-500 ease-out"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 min-h-0 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center h-10 w-full rounded-md transition-all duration-500 ease-out ${
                  isVisualCollapsed
                    ? "justify-center px-0"
                    : "justify-start px-3"
                } ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/10"
                }`
              }
              title={isVisualCollapsed ? label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-all duration-500 ease-out ${isVisualCollapsed ? "" : "mr-3"}`}
              />
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-500 ease-out ${isVisualCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"}`}
              >
                {label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t border-white/10 shrink-0">
          {/* User info */}
          <div
            className={`flex items-center h-10 mb-2 relative ${isVisualCollapsed ? "justify-center" : "px-3"}`}
          >
            <div
              className={`w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 transition-all duration-500 ease-out ${isVisualCollapsed ? "" : "absolute left-3"}`}
              title={user?.name}
            >
              <span className="text-white text-xs font-semibold">
                {getInitials(user?.name || "U")}
              </span>
            </div>
            <div
              className={`min-w-0 overflow-hidden whitespace-nowrap transition-all duration-500 ease-out ${isVisualCollapsed ? "max-w-0 opacity-0" : "ml-11 max-w-[150px] opacity-100"}`}
            >
              <p className="text-white text-sm font-medium truncate">
                {user?.name || "User"}
              </p>
              <p className="text-slate-400 text-[10px] uppercase tracking-wider truncate">
                {user?.role?.replace("_", " ")}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`flex items-center h-10 w-full rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-500 ease-out ${isVisualCollapsed ? "justify-center px-0" : "justify-start px-3"}`}
            title={isVisualCollapsed ? "Logout" : undefined}
          >
            <LogOut
              className={`w-5 h-5 shrink-0 transition-all duration-500 ease-out ${isVisualCollapsed ? "" : "mr-3"}`}
            />
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-500 ease-out ${isVisualCollapsed ? "max-w-0 opacity-0" : "max-w-[150px] opacity-100"}`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
