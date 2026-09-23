import Content from '../content/content.model.js';
import Assignment from '../assignments/assignment.model.js';
import Instructor from '../instructors/instructor.model.js';
import Publication from '../publications/publication.model.js';
import Schedule from '../schedules/schedule.model.js';
import { getStartOfToday, getTodayRange } from '../../utils/dateUtils.js';
import { CONTENT_STATUSES } from '../../utils/statusUtils.js';
import { getDeadlineState } from '../../utils/dateUtils.js';

/**
 * GET /api/dashboard/summary
 * Returns top-level counts for the dashboard stat cards.
 */
export const getSummary = async () => {
  const today = getStartOfToday();
  const { start: todayStart, end: todayEnd } = getTodayRange();

  const [
    totalContent,
    scheduled,
    published,
    pendingReview,
    dueTodayAssignments,
    overdueAssignments,
  ] = await Promise.all([
    Content.countDocuments(),
    Content.countDocuments({ status: CONTENT_STATUSES.SCHEDULED }),
    Content.countDocuments({ status: CONTENT_STATUSES.PUBLISHED }),
    Content.countDocuments({ status: CONTENT_STATUSES.SUBMITTED }),
    // Due today: deadline is today AND content not complete
    Assignment.countDocuments({
      deadline: { $gte: todayStart, $lte: todayEnd },
      status: { $nin: ['PUBLISHED', 'APPROVED', 'SCHEDULED'] },
    }),
    // Overdue: deadline < today AND content not complete
    Assignment.countDocuments({
      deadline: { $lt: today },
      status: { $nin: ['PUBLISHED', 'APPROVED', 'SCHEDULED'] },
    }),
  ]);

  return {
    totalContent,
    scheduled,
    published,
    pendingReview,
    dueToday: dueTodayAssignments,
    overdue: overdueAssignments,
  };
};

/**
 * GET /api/dashboard/deadlines
 * Returns today's deadline assignments with content + instructor info.
 */
export const getDeadlines = async () => {
  const { start, end } = getTodayRange();
  const assignments = await Assignment.find({
    deadline: { $gte: start, $lte: end },
    status: { $nin: ['PUBLISHED', 'APPROVED', 'SCHEDULED'] },
  })
    .populate('contentId', 'title contentType status')
    .populate('instructorId', 'name email profileImage')
    .sort({ deadline: 1 })
    .limit(20);

  return assignments.map((a) => ({
    ...a.toObject(),
    deadlineState: 'DUE_TODAY',
  }));
};

/**
 * GET /api/dashboard/upcoming
 * Returns upcoming assignments (deadline > today, not complete).
 */
export const getUpcoming = async () => {
  const today = getStartOfToday();
  const assignments = await Assignment.find({
    deadline: { $gt: today },
    status: { $nin: ['PUBLISHED', 'APPROVED', 'SCHEDULED'] },
  })
    .populate('contentId', 'title contentType status')
    .populate('instructorId', 'name email profileImage')
    .sort({ deadline: 1 })
    .limit(20);

  return assignments.map((a) => ({
    ...a.toObject(),
    deadlineState: 'UPCOMING',
  }));
};

/**
 * GET /api/dashboard/overdue
 * Returns overdue assignments.
 */
export const getOverdue = async () => {
  const today = getStartOfToday();
  const assignments = await Assignment.find({
    deadline: { $lt: today },
    status: { $nin: ['PUBLISHED', 'APPROVED', 'SCHEDULED'] },
  })
    .populate('contentId', 'title contentType status')
    .populate('instructorId', 'name email profileImage')
    .sort({ deadline: 1 })
    .limit(20);

  return assignments.map((a) => ({
    ...a.toObject(),
    deadlineState: 'OVERDUE',
  }));
};

/**
 * GET /api/dashboard/recent
 * Returns recently published content.
 */
export const getRecent = async () => {
  const publications = await Publication.find()
    .populate('contentId', 'title contentType')
    .populate('publishedBy', 'name email')
    .sort({ publishedAt: -1 })
    .limit(10);

  return publications;
};

/**
 * GET /api/dashboard/activity
 * Returns recent activity log entries.
 */
export const getActivity = async () => {
  const { getActivityLog } = await import('../activityLog/activityLog.service.js');
  const result = await getActivityLog({ page: 1, limit: 15 });
  return result.data;
};
