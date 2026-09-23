import ActivityLog from './activityLog.model.js';

/**
 * Log an activity event. Fails silently — activity logging should never
 * break the main operation.
 */
export const logActivity = async ({ userId, action, entityType, entityId, metadata = {} }) => {
  try {
    await ActivityLog.create({ userId, action, entityType, entityId, metadata });
  } catch (error) {
    console.error('[ActivityLog] Failed to log activity:', error.message);
  }
};

/**
 * Get paginated activity log.
 */
export const getActivityLog = async ({ userId, entityType, entityId, page = 1, limit = 20 }) => {
  const query = {};
  if (userId) query.userId = userId;
  if (entityType) query.entityType = entityType;
  if (entityId) query.entityId = entityId;

  const total = await ActivityLog.countDocuments(query);
  const logs = await ActivityLog.find(query)
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  // Format human-readable descriptions
  const formatted = logs.map(formatActivity);

  return {
    data: formatted,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Generate a human-readable description of an activity.
 */
const formatActivity = (log) => {
  const actor = log.userId?.name || 'Someone';
  const m = log.metadata || {};
  let description = '';

  switch (log.action) {
    case 'INSTRUCTOR_CREATED':
      description = `${actor} created instructor "${m.name}".`;
      break;
    case 'INSTRUCTOR_UPDATED':
      description = `${actor} updated instructor profile.`;
      break;
    case 'INSTRUCTOR_DEACTIVATED':
      description = `${actor} deactivated instructor "${m.name}".`;
      break;
    case 'INSTRUCTOR_ACTIVATED':
      description = `${actor} activated instructor "${m.name}".`;
      break;
    case 'CONTENT_CREATED':
      description = `${actor} created content "${m.title}" (${m.contentType}).`;
      break;
    case 'CONTENT_UPDATED':
      description = `${actor} updated content "${m.title}".`;
      break;
    case 'CONTENT_DELETED':
      description = `${actor} deleted content "${m.title}".`;
      break;
    case 'CONTENT_ASSIGNED':
      description = `${actor} assigned "${m.contentTitle}" to ${m.instructorName} (deadline: ${m.deadline ? new Date(m.deadline).toLocaleDateString() : 'N/A'}).`;
      break;
    case 'DEADLINE_CHANGED':
      description = `${actor} changed deadline for "${m.contentTitle}" to ${m.newDeadline ? new Date(m.newDeadline).toLocaleDateString() : 'N/A'}.`;
      break;
    case 'STATUS_CHANGED':
      description = `${actor} changed status of "${m.title}" from ${m.from} to ${m.to}.`;
      break;
    case 'CONTENT_SCHEDULED':
      description = `${actor} scheduled "${m.contentTitle}" on ${m.platform} for ${m.scheduledDate ? new Date(m.scheduledDate).toLocaleDateString() : 'N/A'}.`;
      break;
    case 'CONTENT_RESCHEDULED':
      description = `${actor} rescheduled content on ${m.platform}.`;
      break;
    case 'SCHEDULE_CANCELLED':
      description = `${actor} cancelled schedule for "${m.contentTitle}" on ${m.platform}.`;
      break;
    case 'CONTENT_PUBLISHED':
      description = `${actor} published "${m.contentTitle}" on ${m.platform}.`;
      break;
    default:
      description = `${actor} performed action: ${log.action}.`;
  }

  return { ...log.toObject(), description };
};
