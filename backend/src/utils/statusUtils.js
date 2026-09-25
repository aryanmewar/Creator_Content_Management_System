/**
 * Centralized content status transition map.
 * Backend enforces this — no arbitrary status jumps allowed.
 */

export const CONTENT_STATUSES = {
  DRAFT: "DRAFT",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  SUBMITTED: "SUBMITTED",
  APPROVED: "APPROVED",
  SCHEDULED: "SCHEDULED",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED",
};

// Valid transitions: key → array of allowed next statuses
const TRANSITION_MAP = {
  DRAFT: ["ASSIGNED"],
  ASSIGNED: ["IN_PROGRESS"],
  IN_PROGRESS: ["COMPLETED", "SUBMITTED"],
  COMPLETED: ["APPROVED", "REJECTED"],
  SUBMITTED: ["APPROVED", "REJECTED"],
  REJECTED: ["IN_PROGRESS"],
  APPROVED: ["SCHEDULED"],
  SCHEDULED: ["PUBLISHED"],
  PUBLISHED: [], // terminal state
};

/**
 * Check if a status transition is valid.
 * @param {string} fromStatus
 * @param {string} toStatus
 * @returns {boolean}
 */
export const isValidTransition = (fromStatus, toStatus) => {
  const allowed = TRANSITION_MAP[fromStatus];
  if (!allowed) return false;
  return allowed.includes(toStatus);
};

/**
 * Get allowed next statuses from a given status.
 * @param {string} currentStatus
 * @returns {string[]}
 */
export const getAllowedTransitions = (currentStatus) => {
  return TRANSITION_MAP[currentStatus] || [];
};

/**
 * Validate transition and return an error message if invalid.
 * @returns {string|null} error message or null if valid
 */
export const validateTransition = (fromStatus, toStatus) => {
  if (!CONTENT_STATUSES[fromStatus]) {
    return `Invalid current status: ${fromStatus}`;
  }
  if (!CONTENT_STATUSES[toStatus]) {
    return `Invalid target status: ${toStatus}`;
  }
  if (!isValidTransition(fromStatus, toStatus)) {
    return `Cannot transition from ${fromStatus} to ${toStatus}. Allowed: ${getAllowedTransitions(fromStatus).join(", ") || "none"}`;
  }
  return null;
};

export const PRIORITY_LEVELS = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export const CONTENT_TYPES = ["Reel", "Post", "Lecture video", "Others"];

export const PLATFORMS = ["Instagram", "YouTube", "LinkedIn", "Facebook"];

export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  CONTENT_MANAGER: "CONTENT_MANAGER",
  CONTRIBUTOR: "CONTRIBUTOR",
};
