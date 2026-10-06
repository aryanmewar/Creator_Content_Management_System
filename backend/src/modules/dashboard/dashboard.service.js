import Content from "../content/content.model.js";
import Assignment from "../assignments/assignment.model.js";
import Instructor from "../instructors/instructor.model.js";
import User from "../auth/auth.model.js";
import Publication from "../publications/publication.model.js";
import Schedule from "../schedules/schedule.model.js";
import OverdueRecord from "../reports/overdueRecord.model.js";
import { getStartOfToday, getTodayRange } from "../../utils/dateUtils.js";
import { CONTENT_STATUSES } from "../../utils/statusUtils.js";
import { getDeadlineState } from "../../utils/dateUtils.js";

const COMPLETED_STATUSES = [
  "SUBMITTED",
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
  "COMPLETED",
];

/**
 * GET /api/dashboard/summary
 * Returns top-level counts for the dashboard stat cards.
 */
export const getSummary = async () => {
  const today = getStartOfToday();
  const { start: todayStart, end: todayEnd } = getTodayRange();

  // 1. Exact count of all content by status
  const [totalContent, statusCountsAggr] = await Promise.all([
    Content.countDocuments(),
    Content.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const statusCounts = {
    DRAFT: 0,
    ASSIGNED: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    SUBMITTED: 0,
    APPROVED: 0,
    SCHEDULED: 0,
    PUBLISHED: 0,
    REJECTED: 0,
  };
  statusCountsAggr.forEach(({ _id, count }) => {
    if (_id) statusCounts[_id] = count;
  });

  // 2. Due today: count unique contents with deadline today and not completed
  const [dueContentDocs, dueAsgnDocs] = await Promise.all([
    Content.find(
      {
        dueDate: { $gte: todayStart, $lte: todayEnd },
        status: { $nin: COMPLETED_STATUSES },
      },
      { _id: 1 }
    ),
    Assignment.find(
      {
        deadline: { $gte: todayStart, $lte: todayEnd },
        status: { $nin: COMPLETED_STATUSES },
      },
      { contentId: 1 }
    ),
  ]);

  const dueTodayIds = new Set([
    ...dueContentDocs.map((d) => d._id.toString()),
    ...dueAsgnDocs.map((d) => d.contentId?.toString()).filter(Boolean),
  ]);
  const dueToday = dueTodayIds.size;

  // 3. Overdue: count unique contents with deadline in past or isOverdue flag, not completed
  const [overdueContentDocs, overdueAsgnDocs] = await Promise.all([
    Content.find(
      {
        $or: [
          { isOverdue: true, status: { $nin: COMPLETED_STATUSES } },
          {
            dueDate: { $lt: today },
            status: { $nin: COMPLETED_STATUSES },
          },
        ],
      },
      { _id: 1 }
    ),
    Assignment.find(
      {
        deadline: { $lt: today },
        status: { $nin: COMPLETED_STATUSES },
      },
      { contentId: 1 }
    ),
  ]);

  const overdueIds = new Set([
    ...overdueContentDocs.map((d) => d._id.toString()),
    ...overdueAsgnDocs.map((d) => d.contentId?.toString()).filter(Boolean),
  ]);
  const overdue = overdueIds.size;

  const scheduled = statusCounts.SCHEDULED || 0;
  const published = statusCounts.PUBLISHED || 0;
  const inPipeline =
    (statusCounts.DRAFT || 0) +
    (statusCounts.ASSIGNED || 0) +
    (statusCounts.IN_PROGRESS || 0) +
    (statusCounts.COMPLETED || 0) +
    (statusCounts.SUBMITTED || 0) +
    (statusCounts.APPROVED || 0) +
    (statusCounts.REJECTED || 0);

  return {
    totalContent,
    statusCounts,
    inPipeline,
    draft: statusCounts.DRAFT || 0,
    assigned: statusCounts.ASSIGNED || 0,
    inProgress: statusCounts.IN_PROGRESS || 0,
    completed: statusCounts.COMPLETED || 0,
    pendingReview: statusCounts.SUBMITTED || 0,
    approved: statusCounts.APPROVED || 0,
    scheduled,
    published,
    rejected: statusCounts.REJECTED || 0,
    dueToday,
    overdue,
  };
};

/**
 * GET /api/dashboard/deadlines
 * Returns today's deadline assignments with content + instructor info.
 * Guaranteed deduplicated by contentId.
 */
export const getDeadlines = async () => {
  const { start, end } = getTodayRange();

  const [assignments, contents] = await Promise.all([
    Assignment.find({
      deadline: { $gte: start, $lte: end },
      status: { $nin: COMPLETED_STATUSES },
    })
      .populate("contentId", "title contentType status referenceLink")
      .populate("instructorId", "name email profileImage")
      .sort({ deadline: 1 })
      .limit(30),
    Content.find({
      dueDate: { $gte: start, $lte: end },
      status: { $nin: COMPLETED_STATUSES },
    })
      .populate("createdBy", "name email profileImage")
      .populate("contributors", "name email profileImage")
      .sort({ dueDate: 1 })
      .limit(30),
  ]);

  const mappedAssignments = assignments
    .filter((a) => a.contentId)
    .map((a) => ({
      ...a.toObject(),
      deadlineState: "DUE_TODAY",
    }));

  const mappedContents = contents.map((c) => ({
    _id: `content-due-${c._id}`,
    contentId: {
      _id: c._id,
      title: c.title,
      contentType: c.contentType,
      status: c.status,
      referenceLink: c.referenceLink,
    },
    instructorId:
      c.contributors && c.contributors.length > 0
        ? c.contributors[0]
        : c.createdBy,
    deadline: c.dueDate,
    deadlineState: "DUE_TODAY",
    isShootDate: true,
  }));

  // Deduplicate by content ID
  const seen = new Set();
  const unique = [];

  for (const item of mappedAssignments) {
    const cid = (item.contentId?._id || item.contentId)?.toString();
    if (cid && !seen.has(cid)) {
      seen.add(cid);
      unique.push(item);
    }
  }

  for (const item of mappedContents) {
    const cid = (item.contentId?._id || item.contentId)?.toString();
    if (cid && !seen.has(cid)) {
      seen.add(cid);
      unique.push(item);
    }
  }

  return unique
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 20);
};

/**
 * GET /api/dashboard/upcoming
 * Returns upcoming assignments (deadline > today, not complete).
 */
export const getUpcoming = async () => {
  const today = getStartOfToday();
  const assignments = await Assignment.find({
    deadline: { $gt: today },
    status: { $nin: COMPLETED_STATUSES },
  })
    .populate("contentId", "title contentType status referenceLink")
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
 * Returns overdue assignments, guaranteed deduplicated by contentId.
 */
export const getOverdue = async () => {
  const today = getStartOfToday();

  const [assignments, contents] = await Promise.all([
    Assignment.find({
      deadline: { $lt: today },
      status: { $nin: COMPLETED_STATUSES },
    })
      .populate("contentId", "title contentType status referenceLink")
      .populate("instructorId", "name email profileImage")
      .sort({ deadline: 1 })
      .limit(30),
    Content.find({
      $or: [
        { isOverdue: true, status: { $nin: COMPLETED_STATUSES } },
        {
          dueDate: { $lt: today },
          status: { $nin: COMPLETED_STATUSES },
        },
      ],
    })
      .populate("createdBy", "name email profileImage")
      .populate("contributors", "name email profileImage")
      .sort({ dueDate: 1 })
      .limit(30),
  ]);

  const mappedAssignments = assignments
    .filter((a) => a.contentId)
    .map((a) => ({
      ...a.toObject(),
      deadlineState: "OVERDUE",
    }));

  const mappedContents = contents.map((c) => ({
    _id: `content-overdue-${c._id}`,
    contentId: {
      _id: c._id,
      title: c.title,
      contentType: c.contentType,
      status: c.status,
      referenceLink: c.referenceLink,
    },
    instructorId:
      c.contributors && c.contributors.length > 0
        ? c.contributors[0]
        : c.createdBy,
    deadline: c.dueDate,
    deadlineState: "OVERDUE",
    isShootDate: true,
  }));

  // Deduplicate by content ID
  const seen = new Set();
  const unique = [];

  for (const item of mappedAssignments) {
    const cid = (item.contentId?._id || item.contentId)?.toString();
    if (cid && !seen.has(cid)) {
      seen.add(cid);
      unique.push(item);
    }
  }

  for (const item of mappedContents) {
    const cid = (item.contentId?._id || item.contentId)?.toString();
    if (cid && !seen.has(cid)) {
      seen.add(cid);
      unique.push(item);
    }
  }

  return unique
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 20);
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
    const publishedBy =
      c.contributors && c.contributors.length > 0
        ? c.contributors[0]
        : c.createdBy;

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

  return publications
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 10);
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

/**
 * GET /api/dashboard/overdue-history
 * Returns historical overdue records
 */
export const getOverdueHistory = async (query = {}) => {
  const { monthYear, instructorId } = query;

  const filter = {};
  if (monthYear) filter.monthYear = monthYear;
  if (instructorId) filter.instructorId = instructorId;

  const records = await OverdueRecord.find(filter)
    .populate("instructorId", "name email designation profileImage")
    .populate("contentId", "title status contentType dueDate isOverdue")
    .sort({ recordedAt: -1, monthYear: -1 });

  return records;
};
