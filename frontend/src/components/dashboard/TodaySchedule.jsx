import React from 'react';
import { CalendarIcon } from 'lucide-react';
import { isToday } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { getPlatformColor } from '../../utils/statusUtils.js';

const TodaySchedule = ({ schedules = [] }) => {
  const todaySchedules = schedules.filter(s => isToday(new Date(s.scheduledDate)));

  return (
    <div className="card p-6">
      <h3 className="section-title mb-4 flex items-center gap-2">
        <CalendarIcon className="w-5 h-5 text-primary-500" />
        Today's Schedule
      </h3>
      <div className="space-y-3">
        {todaySchedules.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No content scheduled for today.</p>
        ) : (
          todaySchedules.map((s) => (
            <div key={s._id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Badge variant="outline" className={`font-bold uppercase tracking-wider text-[10px] ${getPlatformColor(s.platform)}`}>
                {s.platform}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{s.contentId?.title}</p>
                <p className="text-xs text-muted-foreground">Today at {s.scheduledTime}</p>
              </div>
              <Badge variant="secondary" className={`${s.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
                {s.status}
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodaySchedule;
