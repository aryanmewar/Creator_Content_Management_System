/**
 * Deadline state calculator.
 * States are NEVER stored in the DB — they are always derived at runtime.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export const getISTDateParts = (d = new Date()) => {
  const istDate = new Date(new Date(d).getTime() + IST_OFFSET_MS);
  return {
    year: istDate.getUTCFullYear(),
    month: istDate.getUTCMonth(),
    date: istDate.getUTCDate(),
  };
};

/**
 * @param {Date|string} deadline
 * @param {string} contentStatus - current content workflow status
 * @param {Date|string} [completionDate]
 * @returns {'COMPLETED'|'OVERDUE'|'DUE_TODAY'|'UPCOMING'}
 */
export const getDeadlineState = (deadline, contentStatus, completionDate) => {
  const completedStatuses = [
    "IN_PROGRESS",
    "SUBMITTED",
    "PUBLISHED",
    "APPROVED",
    "SCHEDULED",
  ];
  if (completedStatuses.includes(contentStatus)) return "COMPLETED";

  // If shoot date and shoot completion date are same day, content is recorded -> not overdue
  if (deadline && completionDate) {
    const p1 = getISTDateParts(deadline);
    const p2 = getISTDateParts(completionDate);
    if (p1.year === p2.year && p1.month === p2.month && p1.date === p2.date) {
      return "COMPLETED";
    }
  }

  if (!deadline) return "UPCOMING";

  const nowParts = getISTDateParts();
  const deadlineParts = getISTDateParts(deadline);

  const todayKey = `${nowParts.year}-${String(nowParts.month + 1).padStart(2, "0")}-${String(nowParts.date).padStart(2, "0")}`;
  const deadlineKey = `${deadlineParts.year}-${String(deadlineParts.month + 1).padStart(2, "0")}-${String(deadlineParts.date).padStart(2, "0")}`;

  if (deadlineKey < todayKey) return "OVERDUE";
  if (deadlineKey === todayKey) return "DUE_TODAY";
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
 * Returns start and end of today in IST (UTC+05:30).
 * Ensures server deployed in UTC (Render, AWS) matches the local Indian date.
 */
export const getTodayRange = () => {
  const { year, month, date } = getISTDateParts();
  const start = new Date(
    Date.UTC(year, month, date, 0, 0, 0, 0) - IST_OFFSET_MS,
  );
  const end = new Date(
    Date.UTC(year, month, date, 23, 59, 59, 999) - IST_OFFSET_MS,
  );
  return { start, end };
};

/**
 * Returns the start of today in IST (for overdue comparison).
 */
export const getStartOfToday = () => {
  const { year, month, date } = getISTDateParts();
  return new Date(Date.UTC(year, month, date, 0, 0, 0, 0) - IST_OFFSET_MS);
};
