import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobileMenuOpenRef = useRef(isMobileMenuOpen);
  useEffect(() => {
    isMobileMenuOpenRef.current = isMobileMenuOpen;
  }, [isMobileMenuOpen]);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const isRootDashboard =
    location.pathname === "/" || location.pathname === "/my-dashboard";

  // Handle history and mobile back button behavior
  useEffect(() => {
    // If on root dashboard, establish a barrier state if not already set
    if (isRootDashboard && !window.history.state?.rootDashboard) {
      window.history.pushState({ rootDashboard: true }, "");
    }

    const handlePopState = () => {
      // 1. If mobile menu is open, pressing back button closes the menu instead of navigating
      if (isMobileMenuOpenRef.current) {
        setIsMobileMenuOpen(false);
        return;
      }

      // 2. If on root dashboard, prevent back button from exiting or navigating to /login
      const currentPath = window.location.pathname;
      if (currentPath === "/" || currentPath === "/my-dashboard") {
        window.history.pushState({ rootDashboard: true }, "");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isRootDashboard, location.pathname]);

  const handleOpenMobileMenu = () => {
    setIsMobileMenuOpen(true);
    // Push history state so device/browser back button closes mobile drawer
    window.history.pushState({ mobileMenu: true }, "");
  };

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
    // If mobileMenu state is present on top, neutralize it cleanly with replaceState
    if (window.history.state?.mobileMenu) {
      if (isRootDashboard) {
        window.history.replaceState({ rootDashboard: true }, "");
      } else {
        window.history.replaceState(null, "");
      }
    }
  };

  const setMobileMenuOpenState = (open) => {
    if (open) {
      handleOpenMobileMenu();
    } else {
      handleCloseMobileMenu();
    }
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-slate-50/50 bg-grid-pattern relative">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setMobileMenuOpenState}
      />

      {/* Main area */}
      <div
        className={`flex flex-col flex-1 transition-all duration-500 ease-out overflow-hidden ${isCollapsed ? "md:ml-16" : "md:ml-64"}`}
      >
        <Navbar onMenuClick={handleOpenMobileMenu} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
