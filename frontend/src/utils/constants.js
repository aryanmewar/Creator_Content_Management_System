export const CONTENT_STATUSES = {
  DRAFT: 'DRAFT',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  SCHEDULED: 'SCHEDULED',
  PUBLISHED: 'PUBLISHED',
  REJECTED: 'REJECTED',
};

export const CONTENT_TYPES = [
  'Reel',
  'Post',
  'Lecture video'
];

export const PLATFORMS = ['Instagram', 'YouTube', 'LinkedIn', 'Facebook'];

export const PRIORITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  CONTENT_MANAGER: 'CONTENT_MANAGER',
};

// Valid status transitions (mirrors backend)
export const STATUS_TRANSITIONS = {
  DRAFT: ['ASSIGNED'],
  ASSIGNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED', 'SUBMITTED'],
  COMPLETED: ['APPROVED', 'REJECTED'],
  SUBMITTED: ['APPROVED', 'REJECTED'],
  REJECTED: ['IN_PROGRESS'],
  APPROVED: ['SCHEDULED'],
  SCHEDULED: ['PUBLISHED'],
  PUBLISHED: [],
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const PAGINATION_DEFAULT = {
  page: 1,
  limit: 20,
};
