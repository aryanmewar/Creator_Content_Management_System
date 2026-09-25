import Content from "../content/content.model.js";
import Assignment from "../assignments/assignment.model.js";
import Instructor from "../instructors/instructor.model.js";
import Publication from "../publications/publication.model.js";
import Schedule from "../schedules/schedule.model.js";
import { getStartOfToday, getTodayRange } from "../../utils/dateUtils.js";
import { CONTENT_STATUSES } from "../../utils/statusUtils.js";
import { getDeadlineState } from "../../utils/dateUtils.js";

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
    dueTodayContent,
    overdueAssignments,
    overdueContent,
  ] = await Promise.all([
    Content.countDocuments(),
    Content.countDocuments({ status: CONTENT_STATUSES.SCHEDULED }),
    Content.countDocuments({ status: CONTENT_STATUSES.PUBLISHED }),
    Content.countDocuments({ status: CONTENT_STATUSES.SUBMITTED }),
    // Due today: deadline is today AND content not complete
    Assignment.countDocuments({
      deadline: { $gte: todayStart, $lte: todayEnd },
      status: { $nin: ["PUBLISHED", "APPROVED", "SCHEDULED"] },
    }),
    Content.countDocuments({
      dueDate: { $gte: todayStart, $lte: todayEnd },
      status: { $nin: ["PUBLISHED", "APPROVED", "SCHEDULED"] },
    }),
    // Overdue: deadline < today AND status not moved past ASSIGNED
    Assignment.countDocuments({
      deadline: { $lt: today },
      status: { $in: ["ASSIGNED", "DRAFT"] },
    }),
    Content.countDocuments({
      dueDate: { $lt: today },
      status: { $in: ["ASSIGNED", "DRAFT"] },
    }),
  ]);

  return {
    totalContent,
    scheduled,
    published,
    pendingReview,
    dueToday: dueTodayAssignments + dueTodayContent,
    overdue: overdueAssignments + overdueContent,
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
    status: { $nin: ["PUBLISHED", "APPROVED", "SCHEDULED"] },
  })
    .populate("contentId", "title contentType status")
    .populate("instructorId", "name email profileImage")
    .sort({ deadline: 1 })
    .limit(20);

  const mappedAssignments = assignments.map((a) => ({
    ...a.toObject(),
    deadlineState: "DUE_TODAY",
  }));

  const contents = await Content.find({
    dueDate: { $gte: start, $lte: end },
    status: { $nin: ["PUBLISHED", "APPROVED", "SCHEDULED"] },
  })
    .populate("createdBy", "name email profileImage")
    .populate("contributors", "name email profileImage")
    .sort({ dueDate: 1 })
    .limit(20);

  const mappedContents = contents.map((c) => ({
    _id: `content-due-${c._id}`,
    contentId: {
      _id: c._id,
      title: c.title,
      contentType: c.contentType,
      status: c.status
    },
    instructorId: c.contributors && c.contributors.length > 0 ? c.contributors[0] : c.createdBy,
    deadline: c.dueDate,
    deadlineState: "DUE_TODAY",
    isShootDate: true
  }));

  return [...mappedAssignments, ...mappedContents];
};

/**
 * GET /api/dashboard/upcoming
 * Returns upcoming assignments (deadline > today, not complete).
 */
export const getUpcoming = async () => {
  const today = getStartOfToday();
  const assignments = await Assignment.find({
    deadline: { $gt: today },
    status: { $nin: ["PUBLISHED", "APPROVED", "SCHEDULED"] },
  })
    .populate("contentId", "title contentType status")
    .populate("instructorId", "name email profileImage")
    .sort({ deadline: 1 })
    .limit(20);

  return assignments.map((a) => ({
    ...a.toObject(),
    deadlineState: "UPCOMING",
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
    status: { $in: ["DRAFT", "ASSIGNED"] },
  })
    .populate("contentId", "title contentType status")
    .populate("instructorId", "name email profileImage")
    .sort({ deadline: 1 })
    .limit(20);

  const mappedAssignments = assignments.map((a) => ({
    ...a.toObject(),
    deadlineState: "OVERDUE",
  }));

  const contents = await Content.find({
    dueDate: { $lt: today },
    status: { $in: ["DRAFT", "ASSIGNED"] },
  })
    .populate("createdBy", "name email profileImage")
    .populate("contributors", "name email profileImage")
    .sort({ dueDate: 1 })
    .limit(20);

  const mappedContents = contents.map((c) => ({
    _id: `content-overdue-${c._id}`,
    contentId: {
      _id: c._id,
      title: c.title,
      contentType: c.contentType,
      status: c.status
    },
    instructorId: c.contributors && c.contributors.length > 0 ? c.contributors[0] : c.createdBy,
    deadline: c.dueDate,
    deadlineState: "OVERDUE",
    isShootDate: true
  }));

  return [...mappedAssignments, ...mappedContents].sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 20);
};

/**
 * GET /api/dashboard/recent
 * Returns recently published content.
 */
export const getRecent = async () => {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const publishedContent = await Content.find({
    status: "PUBLISHED",
    publishedDate: { $gte: twoDaysAgo },
  })
    .populate("createdBy", "name email profileImage")
    .populate("contributors", "name email profileImage")
    .sort({ publishedDate: -1 })
    .limit(10);

  const publications = [];
  publishedContent.forEach((c) => {
    const publishedBy = c.contributors && c.contributors.length > 0 ? c.contributors[0] : c.createdBy;
    
    let cType = Array.isArray(c.contentType) ? c.contentType[0] : c.contentType;
    if (cType === "Others" && c.otherContentType) cType = c.otherContentType;

    if (c.publishedLinks && c.publishedLinks.length > 0) {
      c.publishedLinks.forEach((link, idx) => {
        publications.push({
          _id: `${c._id}-${idx}`,
          contentId: {
            _id: c._id,
            title: c.title,
            contentType: c.contentType,
          },
          publishedBy,
          publishedAt: c.publishedDate,
          platform: link.platform || cType || "General",
          postUrl: link.url || "#",
        });
      });
    } else {
      publications.push({
        _id: `${c._id}-nolink`,
        contentId: {
          _id: c._id,
          title: c.title,
          contentType: c.contentType,
        },
        publishedBy,
        publishedAt: c.publishedDate,
        platform: cType || "General",
        postUrl: "#",
      });
    }
  });

  return publications.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)).slice(0, 10);
};

/**
 * GET /api/dashboard/activity
 * Returns recent activity log entries.
 */
export const getActivity = async () => {
  const { getActivityLog } =
    await import("../activityLog/activityLog.service.js");
  const result = await getActivityLog({ page: 1, limit: 15 });
  return result.data;
};
