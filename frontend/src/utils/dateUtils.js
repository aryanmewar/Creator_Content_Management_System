import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isPast,
} from "date-fns";

/**
 * Format a date as "Sep 20, 2024"
 */
export const formatDate = (date) => {
  if (!date) return "N/A";
  return format(new Date(date), "MMM d, yyyy");
};

/**
 * Format a date as "Sep 20, 2024 at 6:00 PM"
 */
export const formatDateTime = (date) => {
  if (!date) return "N/A";
  return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
};

/**
 * Format relative time — "2 hours ago", "in 3 days"
 */
export const formatRelative = (date) => {
  if (!date) return "N/A";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

/**
 * Get human-friendly deadline label
 */
export const getDeadlineLabel = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isToday(d)) return "Due Today";
  if (isTomorrow(d)) return "Due Tomorrow";
  if (isPast(d)) return `Overdue (${format(d, "MMM d")})`;
  return `Due ${format(d, "MMM d, yyyy")}`;
};

/**
 * Calculate deadline state dynamically (mirrors backend logic)
 */
export const getDeadlineState = (deadline, contentStatus) => {
  const completedStatuses = ["PUBLISHED", "APPROVED", "SCHEDULED"];
  if (completedStatuses.includes(contentStatus)) return "COMPLETED";
  if (!deadline) return "UPCOMING";

  const now = new Date();
  const dl = new Date(deadline);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dlDay = new Date(dl.getFullYear(), dl.getMonth(), dl.getDate());

  if (dlDay < today) return "OVERDUE";
  if (dlDay.getTime() === today.getTime()) return "DUE_TODAY";
  return "UPCOMING";
};

/**
 * Format deadline state to a human label
 */
export const deadlineStateLabel = {
  OVERDUE: "Overdue",
  DUE_TODAY: "Due Today",
  UPCOMING: "Upcoming",
  COMPLETED: "Completed",
};
