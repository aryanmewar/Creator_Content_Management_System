import Assignment from "../assignments/assignment.model.js";
import Instructor from "../instructors/instructor.model.js";
import Content from "../content/content.model.js";
import Schedule from "../schedules/schedule.model.js";
import OverdueRecord from "../reports/overdueRecord.model.js";
import { getStartOfToday, getTodayRange } from "../../utils/dateUtils.js";

/**
 * Helper to get the instructor ID for a given user.
 */
const getInstructorForUser = async (userId) => {
  const instructor = await Instructor.findOne({ userId });
  if (!instructor) {
    const err = new Error("No contributor profile found for this user.");
    err.statusCode = 404;
    throw err;
  }
  return instructor;
};

/**
 * GET /api/contributor/dashboard
 */
export const getDashboard = async (userId) => {
  const instructor = await getInstructorForUser(userId);

  const [totalAssigned, assigned, inProgress, pendingReview, published, overdue] =
    await Promise.all([
      Content.countDocuments({
        contributors: instructor._id,
        status: { $ne: "DRAFT" },
      }),
      Content.countDocuments({
        contributors: instructor._id,
        status: "ASSIGNED",
      }),
      Content.countDocuments({
        contributors: instructor._id,
        status: { $in: ["IN_PROGRESS", "REJECTED"] },
      }),
      Content.countDocuments({
        contributors: instructor._id,
        status: "SUBMITTED",
      }),
      Content.countDocuments({
        contributors: instructor._id,
        status: "PUBLISHED",
      }),
      Content.countDocuments({
        contributors: instructor._id,
        $or: [
          { isOverdue: true },
          { dueDate: { $lt: getStartOfToday() }, status: "ASSIGNED" },
        ],
      }),
    ]);

  const { start, end } = getTodayRange();

  // 1. Today's Deadlines
  const todayDeadlinesContents = await Content.find({
    contributors: instructor._id,
    dueDate: { $gte: start, $lte: end },
    status: { $nin: ["PUBLISHED", "APPROVED", "SCHEDULED"] },
  })
    .populate("createdBy", "name email profileImage")
    .populate("contributors", "name email profileImage")
    .sort({ dueDate: 1 });

  const todayDeadlines = todayDeadlinesContents.map((c) => ({
    _id: `content-due-${c._id}`,
    contentId: {
      _id: c._id,
      title: c.title,
      contentType: c.contentType,
      status: c.status,
    },
    instructorId:
      c.contributors && c.contributors.length > 0
        ? c.contributors[0]
        : c.createdBy,
    deadline: c.dueDate,
    deadlineState: "DUE_TODAY",
    isShootDate: true,
  }));

  // 2. Today's Schedules (For this contributor)
  const todaySchedulesContent = await Content.find({
    contributors: instructor._id,
    status: "SCHEDULED",
  })
    .populate("createdBy", "name email profileImage")
    .populate("contributors", "name email profileImage");

  const mappedSchedules = todaySchedulesContent
    .filter((c) => c.scheduledDate)
    .map((c) => {
      let cType = Array.isArray(c.contentType)
        ? c.contentType[0]
        : c.contentType;
      if (cType === "Others" && c.otherContentType) cType = c.otherContentType;

      return {
        _id: `content-${c._id}`,
        contentId: c,
        platform: cType || "General",
        scheduledDate: c.scheduledDate,
        scheduledTime: c.scheduledTime || "",
        status: "SCHEDULED",
      };
    });

  // Check schedules collection too (though rarely used directly if Content has schedules)
  const date = new Date();
  const rawSchedules = await Schedule.find({
    instructorId: instructor._id,
    date: {
      $gte: new Date(date.getFullYear(), date.getMonth(), 1),
      $lte: new Date(date.getFullYear(), date.getMonth() + 1, 0),
    },
  }).populate("contentId", "title contentType");

  const todaySchedules = [...rawSchedules, ...mappedSchedules];

  return {
    totalAssigned,
    assigned,
    inProgress,
    pendingReview,
    published,
    overdue,
    todayDeadlines,
    todaySchedules,
  };
};

/**
 * GET /api/contributor/assignments
 */
export const getAssignments = async (userId) => {
  const instructor = await getInstructorForUser(userId);

  const pipeline = [
    { $match: { contributors: instructor._id, status: { $ne: "DRAFT" } } },
    { $sort: { updatedAt: -1 } },
  ];
  const contentDocs = await Content.aggregate(pipeline);
  const contentItems = contentDocs.map((doc) => Content.hydrate(doc));

  return contentItems.map((c) => ({
    _id: c._id,
    contentId: {
      title: c.title,
      contentType: Array.isArray(c.contentType)
        ? c.contentType.join(", ")
        : c.contentType,
      referenceLink: c.referenceLink,
      status: c.status,
    },
    dueDate: c.dueDate,
    deadline: c.completionDate,
    status: c.status,
    submittedAt: ["SUBMITTED", "APPROVED", "SCHEDULED", "PUBLISHED"].includes(
      c.status,
    )
      ? c.updatedAt
      : null,
    isCheckedByContributor: c.isCheckedByContributor,
    createdAt: c.createdAt,
  }));
};

/**
 * GET /api/contributor/report
 */
export const getReport = async (userId) => {
  const instructor = await getInstructorForUser(userId);

  const pipeline = [
    { $match: { contributors: instructor._id, status: { $ne: "DRAFT" } } },
    { $sort: { updatedAt: -1 } },
  ];
  const contentDocs = await Content.aggregate(pipeline);
  const contentItems = contentDocs.map((doc) => Content.hydrate(doc));

  const overdueRecords = await OverdueRecord.find({ instructorId: instructor._id });
  const overdueContentIds = new Set(overdueRecords.map(r => r.contentId.toString()));

  const assignments = contentItems.map((c) => ({
    _id: c._id,
    contentId: {
      title: c.title,
      contentType: Array.isArray(c.contentType)
        ? c.contentType.join(", ")
        : c.contentType,
      status: c.status,
    },
    dueDate: c.dueDate,
    deadline: c.completionDate,
    status: c.status,
    publishedLinks: c.publishedLinks,
    isOverdue: c.isOverdue || overdueContentIds.has(c._id.toString()),
    submittedAt: ["SUBMITTED", "APPROVED", "SCHEDULED", "PUBLISHED"].includes(
      c.status,
    )
      ? c.updatedAt
      : null,
  }));

  // Compute a simple performance report
  const total = assignments.length;
  const published = assignments.filter((a) => a.status === "PUBLISHED").length;
  const overdue = assignments.filter(
    (a) =>
      a.dueDate &&
      a.dueDate < getStartOfToday() &&
      ["ASSIGNED", "DRAFT"].includes(a.status),
  ).length;

  // Calculate on-time rate
  const completed = assignments.filter((a) =>
    ["SUBMITTED", "PUBLISHED", "APPROVED", "SCHEDULED"].includes(a.status),
  );
  const onTime = completed.filter((a) => !a.isOverdue).length;
  const onTimeRate =
    completed.length > 0 ? (onTime / completed.length) * 100 : 0;

  return {
    metrics: {
      total,
      published,
      overdue,
      onTimeRate: onTimeRate.toFixed(1),
    },
    history: assignments,
  };
};

/**
 * PATCH /api/contributor/content/:id/check
 * Mark assigned content as checked by contributor
 */
export const markContentAsChecked = async (userId, contentId) => {
  const instructor = await getInstructorForUser(userId);

  const content = await Content.findOne({
    _id: contentId,
    contributors: instructor._id,
  });

  if (!content) {
    const err = new Error("Content not found or not assigned to you.");
    err.statusCode = 404;
    throw err;
  }

  content.isCheckedByContributor = true;
  await content.save();

  // Notify admins
  // Find all ADMINs
  const { default: User } = await import("../auth/auth.model.js");
  const { createNotification } = await import("../notifications/notification.service.js");
  const admins = await User.find({ role: "ADMIN" });
  for (const admin of admins) {
    await createNotification({
      userId: admin._id,
      title: "Content Acknowledged",
      message: `${instructor.name} has checked the assigned content "${content.title}".`,
      type: "SUCCESS",
    });
  }

  return content;
};
