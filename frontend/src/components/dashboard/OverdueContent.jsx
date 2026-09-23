import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { getStatusColor, getStatusLabel, getPriorityColor } from '../../utils/statusUtils.js';
import { formatDate, getDeadlineLabel } from '../../utils/dateUtils.js';
import { getInitials } from '../../utils/formatUtils.js';

const OverdueContent = ({ items = [] }) => {
  if (!items.length) {
    return (
      <div className="card p-6">
        <h3 className="section-title flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500" />
          Overdue Content
        </h3>
        <p className="text-sm text-slate-400 text-center py-6 flex items-center justify-center gap-1.5">No overdue content <CheckCircle2 className="w-4 h-4 text-green-500" /></p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          Overdue Content
          <span className="badge bg-red-100 text-red-600">{items.length}</span>
        </h3>
      </div>

      <div className="space-y-3">
        {items.slice(0, 5).map((assignment) => (
          <div key={assignment._id} className="flex items-center gap-3 p-3 rounded-xl border border-red-100 bg-red-50/50">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <span className="text-red-700 text-xs font-semibold">
                {getInitials(assignment.instructorId?.name || 'I')}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {assignment.contentId?.title || 'Untitled'}
              </p>
              <p className="text-xs text-red-500 font-medium">
                {getDeadlineLabel(assignment.deadline)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverdueContent;
