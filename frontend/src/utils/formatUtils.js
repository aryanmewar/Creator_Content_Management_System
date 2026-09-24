/**
 * Truncate text to a max length
 */
export const truncate = (text, maxLength = 50) => {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

/**
 * Get initials from a name
 */
export const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

/**
 * Format a number with commas
 */
export const formatNumber = (n) => {
  if (n === null || n === undefined) return "0";
  return n.toLocaleString();
};

/**
 * Build query string from object, omitting null/undefined/empty values
 */
export const buildQueryString = (params) => {
  const filtered = Object.entries(params)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  return filtered.length ? "?" + filtered.join("&") : "";
};

/**
 * Format a date as "X time ago"
 */
export const timeAgo = (dateInput) => {
  if (!dateInput) return "Never";
  const date = new Date(dateInput);
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return "Just now";
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  
  const years = Math.floor(days / 365);
  return `${years}y ago`;
};
