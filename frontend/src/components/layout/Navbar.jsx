import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Menu, Hand } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import { Button } from '@/components/ui/button';

const pageTitles = {
  '/': 'Dashboard',
  '/instructors': 'Contributors',
  '/content': 'Owners Content',
  '/assign-content': 'Contributors Content',
  '/schedule': 'Schedule',
  '/reports': 'Reports & Analytics',
  '/settings': 'Settings',
};

const pageSubtitles = {
  '/': 'Overview of your content pipeline',
  '/instructors': 'Manage contributor profiles and assignments',
  '/content': 'Create, manage, and track all content',
  '/assign-content': 'Track and manage content assigned to additional contributors',
  '/schedule': 'Schedule content across platforms',
  '/reports': 'Content performance overview',
  '/settings': 'Manage your account and preferences',
};

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Content Manager';
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
            <p className="text-xs text-slate-500 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications (future feature) */}
        <Button variant="outline" size="icon" className="h-9 w-9 text-slate-500">
          <Bell className="w-4 h-4" />
        </Button>

        {/* Date */}
        <div className="hidden md:block text-right">
          <p className="text-xs text-slate-500">
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
