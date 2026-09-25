/**
 * Deadline state calculator.
 * States are NEVER stored in the DB — they are always derived at runtime.
 */

/**
 * @param {Date|string} deadline
 * @param {string} contentStatus - current content workflow status
 * @returns {'COMPLETED'|'OVERDUE'|'DUE_TODAY'|'UPCOMING'}
 */
export const getDeadlineState = (deadline, contentStatus) => {
  const completedStatuses = ["IN_PROGRESS", "SUBMITTED", "PUBLISHED", "APPROVED", "SCHEDULED"];
  if (completedStatuses.includes(contentStatus)) return "COMPLETED";

  if (!deadline) return "UPCOMING";

  const now = new Date();
  const deadlineDate = new Date(deadline);

  // Normalize to start-of-day for date comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deadlineDay = new Date(
    deadlineDate.getFullYear(),
    deadlineDate.getMonth(),
    deadlineDate.getDate(),
  );

  if (deadlineDay < today) return "OVERDUE";
  if (deadlineDay.getTime() === today.getTime()) return "DUE_TODAY";
  return "UPCOMING";
};

/**
 * Check if a deadline is before an assigned date.
 * Returns true if valid (deadline >= assignedDate).
 */
export const isDeadlineValid = (deadline, assignedDate) => {
  const dl = new Date(deadline);
  const ad = new Date(assignedDate);
  return dl >= ad;
};

/**
 * Returns start and end of today in UTC.
 */
export const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

/**
 * Returns the start of today (for overdue comparison).
 */
export const getStartOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
