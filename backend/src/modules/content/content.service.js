import Content from "./content.model.js";
import Assignment from "../assignments/assignment.model.js";
import Publication from "../publications/publication.model.js";
import User from "../auth/auth.model.js";
import Instructor from "../instructors/instructor.model.js";
import OverdueRecord from "../reports/overdueRecord.model.js";
import { logActivity } from "../activityLog/activityLog.service.js";
import * as notificationService from "../notifications/notification.service.js";
import Notification from "../notifications/notification.model.js";
import ActivityLog from "../activityLog/activityLog.model.js";
import {
  validateTransition,
  CONTENT_STATUSES,
} from "../../utils/statusUtils.js";
import { getDeadlineState } from "../../utils/dateUtils.js";

/**
 * Get paginated, filtered, searchable content list.
 */
export const getContent = async ({
  search,
  status,
  contentType,
  instructor,
  page = 1,
  limit = 20,
  sortBy = "createdAt",
  sortOrder = "desc",
  dateFrom,
  dateTo,
  isOwnerContent,
  hasContributors,
}) => {
  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { notes: { $regex: search, $options: "i" } },
    ];
  }
  if (status) query.status = status;
  if (contentType) query.contentType = contentType;
  if (isOwnerContent === "true" || isOwnerContent === true) {
    query.isOwnerContent = true;
  }
  if (hasContributors === "true" || hasContributors === true) {
    query["contributors.0"] = { $exists: true };
  }
  if (instructor) {
    // Content is a Mongoose model, so we can access mongoose through it
    const mongoose = Content.base;
    query.contributors = new mongoose.Types.ObjectId(instructor);
  }
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  const skip = (page - 1) * limit;
  const countQuery = { ...query };
  delete countQuery.status;

  const sort = {};
  if (sortBy === "publishedDate") {
    sort.publishedDate = sortOrder === "asc" ? 1 : -1;
    sort.updatedAt = sortOrder === "asc" ? 1 : -1;
  } else {
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    sort.createdAt = -1;
  }

  // Execute independent database queries in parallel to eliminate sequential latency
  const [total, content, statusCountsAggr, totalCount] = await Promise.all([
    Content.countDocuments(query),
    Content.find(query)
      .populate("contributors", "name email designation profileImage")
      .populate("createdBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Content.aggregate([
      { $match: countQuery },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Content.countDocuments(countQuery),
  ]);

  // ── Single $lookup to join assignments — eliminates N+1 queries ──────────
  // Collect all content IDs in one pass, then lookup all assignments at once
  const contentIds = content.map((c) => c._id || c.id);
  const assignments = await Assignment.find(
    { contentId: { $in: contentIds } },
    { contentId: 1, deadline: 1, priority: 1, createdAt: 1 },
  ).sort({ createdAt: -1 });

  // Build a map: contentId → most recent assignment
  const assignmentMap = {};
  assignments.forEach((a) => {
    const key = a.contentId.toString();
    if (!assignmentMap[key]) assignmentMap[key] = a; // already sorted desc
  });

  const enriched = content.map((item) => {
    const doc = typeof item.toObject === "function" ? item.toObject() : item;
    const asgn = assignmentMap[doc._id.toString()];
    const deadlineState = asgn
      ? getDeadlineState(asgn.deadline, doc.status)
      : null;
    return {
      ...doc,
      assignment: asgn
        ? { deadline: asgn.deadline, priority: asgn.priority, deadlineState }
        : null,
    };
  });

  const statusCounts = { All: totalCount };
  statusCountsAggr.forEach(({ _id, count }) => {
    if (_id) statusCounts[_id] = count;
  });

  return {
    data: enriched,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
    statusCounts,
  };
};

/**
 * Get single content item by ID.
 */
export const getContentById = async (id) => {
  const content = await Content.findById(id)
    .populate("contributors", "name email designation profileImage")
    .populate("createdBy", "name email");

  if (!content) {
    const err = new Error("Content not found.");
    err.statusCode = 404;
    err.code = "NOT_FOUND";
    throw err;
  }

  const [assignment, publications] = await Promise.all([
    Assignment.findOne({ contentId: id }).sort({ createdAt: -1 }),
    Publication.find({ contentId: id }).sort({ publishedAt: -1 }),
  ]);

  const deadlineState = assignment
    ? getDeadlineState(assignment.deadline, content.status)
    : null;

  return {
    ...content.toObject(),
    assignment: assignment ? { ...assignment.toObject(), deadlineState } : null,
    publications,
  };
};

/**
 * Create new content (starts as DRAFT).
 */
export const createContent = async (data, userId) => {
  if (data.title) {
    const trimmedTitle = data.title.trim();
    const escapedTitle = trimmedTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const duplicate = await Content.findOne({
      title: { $regex: `^${escapedTitle}$`, $options: "i" },
    });
    if (duplicate) {
      const err = new Error(
        `A content with the title "${trimmedTitle}" already exists. Duplicate content names are not allowed.`
      );
      err.statusCode = 409;
      err.code = "DUPLICATE_TITLE";
      throw err;
    }
  }

  const content = await Content.create({
    ...data,
    createdBy: userId,
    status: CONTENT_STATUSES.DRAFT,
  });

  await logActivity({
    userId,
    action: "CONTENT_CREATED",
    entityType: "Content",
    entityId: content._id,
    metadata: { title: content.title, contentType: content.contentType },
  });

  return content.populate(["contributors", "createdBy"]);
};

/**
 * Update content fields (does NOT change status — use updateContentStatus for that).
 */
export const updateContent = async (id, data, userId) => {
  // Explicitly whitelist only the fields that a manager is allowed to update
  const allowedFields = {};
  const editableFields = [
    "title",
    "referenceLink",
    "contentType",
    "otherContentType",
    "contributors",
    "dueDate",
    "completionDate",
    "notes",
    "scheduledDate",
    "scheduledTime",
    "publishedLinks",
    "publishedDate",
    "thumbnail",
    "isOwnerContent",
  ];
  editableFields.forEach((field) => {
    if (data[field] !== undefined) allowedFields[field] = data[field];
  });

  const existingContent = await Content.findById(id).populate("contributors");
  if (!existingContent) {
    const err = new Error("Content not found.");
    err.statusCode = 404;
    err.code = "NOT_FOUND";
    throw err;
  }

  if (allowedFields.title) {
    const trimmedTitle = allowedFields.title.trim();
    const escapedTitle = trimmedTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const duplicate = await Content.findOne({
      _id: { $ne: id },
      title: { $regex: `^${escapedTitle}$`, $options: "i" },
    });
    if (duplicate) {
      const err = new Error(
        `A content with the title "${trimmedTitle}" already exists. Duplicate content names are not allowed.`
      );
      err.statusCode = 409;
      err.code = "DUPLICATE_TITLE";
      throw err;
    }
  }

  if (allowedFields.dueDate !== undefined) {
    const newDueDate = allowedFields.dueDate ? new Date(allowedFields.dueDate).setHours(0, 0, 0, 0) : null;
    const today = new Date().setHours(0, 0, 0, 0);

    if (newDueDate === null || newDueDate >= today) {
      // If the admin corrects the date to the future (or null), 
      // it means it was never supposed to be overdue. Clear the history.
      allowedFields.isOverdue = false;
      await OverdueRecord.deleteMany({ contentId: id });
    } else {
      // If it is changed to the past, we only set isOverdue to true if it is still active.
      // We don't want to make completed items overdue retroactively unless explicitly required.
      if (["ASSIGNED", "DRAFT"].includes(existingContent.status)) {
        allowedFields.isOverdue = true;
      }
    }

    // Sync Assignment deadline if dueDate is updated
    await Assignment.updateMany({ contentId: id }, { deadline: allowedFields.dueDate });
  }

  const content = await Content.findByIdAndUpdate(id, allowedFields, {
    new: true,
    runValidators: true,
  })
    .populate("contributors", "name email designation")
    .populate("createdBy", "name email");

  await logActivity({
    userId,
    action: "CONTENT_UPDATED",
    entityType: "Content",
    entityId: content._id,
    metadata: {
      title: content.title,
      updatedFields: Object.keys(allowedFields),
    },
  });

  return content;
};

/**
 * Delete content — only allowed for DRAFT or when no publications exist.
 */
export const deleteContent = async (id, userId) => {
  const content = await Content.findById(id);
  if (!content) {
    const err = new Error("Content not found.");
    err.statusCode = 404;
    err.code = "NOT_FOUND";
    throw err;
  }

  // Escape special regex characters in the title just in case
  const escapedTitle = content.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Also remove associated assignments, publications, activity logs, and notifications
  await Assignment.deleteMany({ contentId: id });
  await Publication.deleteMany({ contentId: id });
  
  // Remove prior activity logs for this specific content
  await ActivityLog.deleteMany({ entityType: "Content", entityId: id });

  // Remove notifications containing the title of the deleted content
  await Notification.deleteMany({
    message: { $regex: escapedTitle, $options: "i" }
  });

  await Content.findByIdAndDelete(id);

  // Note: We deliberately do NOT log a CONTENT_DELETED activity here, 
  // as the user requested that NO trace of the content should be left behind.

  return true;
};

/**
 * Update content status — enforces transition map.
 */
export const updateContentStatus = async (
  id,
  newStatus,
  userId,
  feedback = null,
  scheduledDate = undefined,
  scheduledTime = undefined,
  publishedLinks = undefined,
  publishedDate = undefined,
) => {
  const content = await Content.findById(id);
  if (!content) {
    const err = new Error("Content not found.");
    err.statusCode = 404;
    err.code = "NOT_FOUND";
    throw err;
  }

  // ── Enforce transition rules ──────────────────────────────────────────────
  const oldStatus = content.status; // Capture BEFORE mutation (fixes activity log)
  
  // If moving back to ASSIGNED from DRAFT (e.g., admin assigns it), clear isCheckedByContributor
  if (newStatus === CONTENT_STATUSES.ASSIGNED && oldStatus !== CONTENT_STATUSES.ASSIGNED) {
    content.isCheckedByContributor = false;
  }

  const transitionError = validateTransition(oldStatus, newStatus);
  if (transitionError) {
    const err = new Error(transitionError);
    err.statusCode = 400;
    err.code = "INVALID_TRANSITION";
    throw err;
  }

  const launchDate = new Date("2026-10-01T00:00:00Z");
  const isAfterLaunch = content.dueDate && new Date(content.dueDate) >= launchDate;

  const wasOverdue =
    isAfterLaunch &&
    (content.isOverdue ||
      (oldStatus === CONTENT_STATUSES.ASSIGNED &&
        content.dueDate &&
        new Date(content.dueDate).setHours(0, 0, 0, 0) <
          new Date().setHours(0, 0, 0, 0)));

  // If content is currently ASSIGNED and overdue, history is logged below via OverdueRecord.
  // But we clear the CURRENT overdue flag so the UI tag disappears when status changes.
  if (oldStatus === CONTENT_STATUSES.ASSIGNED && newStatus !== CONTENT_STATUSES.ASSIGNED) {
    content.isOverdue = false;
  }

  content.status = newStatus;

  if (scheduledDate !== undefined) {
    content.scheduledDate = scheduledDate;
    content.scheduleNotificationSent = false;
  }
  if (scheduledTime !== undefined) {
    content.scheduledTime = scheduledTime;
    content.scheduleNotificationSent = false;
  }
  if (newStatus === CONTENT_STATUSES.SCHEDULED) {
    content.scheduleNotificationSent = false;
  }
  if (publishedLinks !== undefined) {
    content.publishedLinks = publishedLinks;
  }
  if (publishedDate !== undefined) {
    content.publishedDate = publishedDate;
  }

  await content.save();

  // Update assignment status if it exists
  if (newStatus === CONTENT_STATUSES.SUBMITTED) {
    await Assignment.findOneAndUpdate(
      { contentId: id },
      { status: "SUBMITTED", submittedAt: new Date() },
    );
  }
  if (newStatus === CONTENT_STATUSES.APPROVED) {
    await Assignment.findOneAndUpdate(
      { contentId: id },
      { status: "APPROVED" },
    );
  }
  if (newStatus === CONTENT_STATUSES.REJECTED) {
    await Assignment.findOneAndUpdate(
      { contentId: id },
      { status: "REJECTED", feedback },
    );
  }

  await logActivity({
    userId,
    action: "STATUS_CHANGED",
    entityType: "Content",
    entityId: content._id,
    metadata: {
      title: content.title,
      from: oldStatus,
      to: newStatus,
      feedback,
    },
  });

  // Notifications
  const assignment = await Assignment.findOne({ contentId: id }).populate(
    "instructorId",
  );

  if (assignment && assignment.instructorId && assignment.instructorId.userId) {
    // If Admin/Manager changes status, notify the contributor
    if (
      newStatus === CONTENT_STATUSES.APPROVED ||
      newStatus === CONTENT_STATUSES.REJECTED ||
      newStatus === CONTENT_STATUSES.PUBLISHED ||
      newStatus === CONTENT_STATUSES.ASSIGNED
    ) {
      const msg = newStatus === CONTENT_STATUSES.ASSIGNED 
        ? `You have been assigned new content: "${content.title}".`
        : `Your content "${content.title}" is now ${newStatus}. ${feedback ? "Feedback: " + feedback : ""}`;

      await notificationService.createNotification({
        userId: assignment.instructorId.userId,
        title: newStatus === CONTENT_STATUSES.ASSIGNED ? "New Assignment" : "Content Status Updated",
        message: msg,
        type: newStatus === CONTENT_STATUSES.REJECTED ? "WARNING" : "SUCCESS",
        link: "/contributor",
      });
    }
  }

  // Fallback: Notify contributor directly if no assignment document was found, but status is ASSIGNED
  if ((!assignment || !assignment.instructorId) && newStatus === CONTENT_STATUSES.ASSIGNED && content.contributors?.length > 0) {
    const instructor = await Instructor.findById(content.contributors[0]);
    if (instructor && instructor.userId) {
      await notificationService.createNotification({
        userId: instructor.userId,
        title: "New Assignment",
        message: `You have been assigned new content: "${content.title}".`,
        type: "SUCCESS",
        link: "/contributor",
      });
    }
  }

  // If Contributor submits content, notify Admins (Created By)
  if (newStatus === CONTENT_STATUSES.SUBMITTED) {
    if (content.createdBy) {
      await notificationService.createNotification({
        userId: content.createdBy,
        title: "Content Submitted",
        message: `Contributor has submitted "${content.title}" for review.`,
        type: "INFO",
        link: "/content",
      });
    }
  }

  // Record Overdue History if status changed while overdue
  if (wasOverdue) {
    const instructorToRecord =
      assignment && assignment.instructorId
        ? assignment.instructorId._id || assignment.instructorId
        : content.contributors && content.contributors.length > 0
          ? content.contributors[0]
          : null;

    if (instructorToRecord) {
      const now = new Date();
      const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      await OverdueRecord.updateOne(
        {
          contentId: id,
          instructorId: instructorToRecord,
          monthYear,
        },
        { $setOnInsert: { recordedAt: new Date() } },
        { upsert: true }
      );
    }
  }

  return content.populate(["contributors", "createdBy"]);
};
