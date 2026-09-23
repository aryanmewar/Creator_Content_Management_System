import { CONTENT_STATUSES, STATUS_TRANSITIONS } from './constants.js';

/**
 * Get Tailwind color classes for a content status badge
 */
export const getStatusColor = (status) => {
  const map = {
    DRAFT: 'bg-slate-100 text-slate-600',
    ASSIGNED: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-amber-100 text-amber-700',
    SUBMITTED: 'bg-purple-100 text-purple-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    SCHEDULED: 'bg-sky-100 text-sky-700',
    PUBLISHED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-600',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
};

/**
 * Get status display label
 */
export const getStatusLabel = (status) => {
  const map = {
    DRAFT: 'Draft',
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In Progress',
    SUBMITTED: 'Submitted',
    APPROVED: 'Approved',
    SCHEDULED: 'Scheduled',
    PUBLISHED: 'Published',
    REJECTED: 'Rejected',
  };
  return map[status] || status;
};

/**
 * Get priority color classes
 */
export const getPriorityColor = (priority) => {
  const map = {
    LOW: 'bg-slate-100 text-slate-600',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-orange-100 text-orange-700',
    URGENT: 'bg-red-100 text-red-600',
  };
  return map[priority] || 'bg-slate-100 text-slate-600';
};

/**
 * Get deadline state color classes
 */
export const getDeadlineStateColor = (state) => {
  const map = {
    OVERDUE: 'bg-red-100 text-red-600',
    DUE_TODAY: 'bg-amber-100 text-amber-700',
    UPCOMING: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
  };
  return map[state] || 'bg-slate-100 text-slate-600';
};

/**
 * Get allowed transitions from current status (frontend display)
 */
export const getAllowedTransitions = (currentStatus) => {
  return STATUS_TRANSITIONS[currentStatus] || [];
};

/**
 * Platform color classes
 */
export const getPlatformColor = (platform) => {
  const map = {
    Instagram: 'bg-pink-100 text-pink-700',
    YouTube: 'bg-red-100 text-red-600',
    LinkedIn: 'bg-blue-100 text-blue-700',
    Facebook: 'bg-indigo-100 text-indigo-700',
  };
  return map[platform] || 'bg-slate-100 text-slate-600';
};
