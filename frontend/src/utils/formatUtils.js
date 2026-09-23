/**
 * Truncate text to a max length
 */
export const truncate = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

/**
 * Get initials from a name
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

/**
 * Format a number with commas
 */
export const formatNumber = (n) => {
  if (n === null || n === undefined) return '0';
  return n.toLocaleString();
};

/**
 * Build query string from object, omitting null/undefined/empty values
 */
export const buildQueryString = (params) => {
  const filtered = Object.entries(params)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  return filtered.length ? '?' + filtered.join('&') : '';
};
