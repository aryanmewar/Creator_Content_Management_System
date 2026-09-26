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
 * Format a 24-hour time string ("15:30") to 12-hour ("3:30 PM")
 */
export const formatTime12Hour = (timeStr) => {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":");
  if (!hours || !minutes) return timeStr;

  const h = parseInt(hours, 10);
  const m = parseInt(minutes, 10);

  const ampm = h >= 12 ? "PM" : "AM";
  const formattedHours = h % 12 || 12;
  const formattedMinutes = m.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMinutes} ${ampm}`;
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
  const completedStatuses = [
    "IN_PROGRESS",
    "SUBMITTED",
    "PUBLISHED",
    "APPROVED",
    "SCHEDULED",
  ];
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

/**
 * Generate month options for filter dropdowns (e.g. "Sep 2024")
 * Starts from Sept 2026 backwards
 */
export const generateMonthOptions = () => {
  const options = [];
  const currentDate = new Date();

  const startYear = 2026;
  const startMonth = 8; // September (0-indexed)

  let iterYear = currentDate.getFullYear();
  let iterMonth = currentDate.getMonth();

  while (
    iterYear > startYear ||
    (iterYear === startYear && iterMonth >= startMonth)
  ) {
    const d = new Date(iterYear, iterMonth, 1);
    const monthStr = d.toLocaleString("default", { month: "short" });
    const valStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    options.push({ label: `${monthStr} ${d.getFullYear()}`, value: valStr });

    iterMonth--;
    if (iterMonth < 0) {
      iterMonth = 11;
      iterYear--;
    }
  }

  return options;
};

