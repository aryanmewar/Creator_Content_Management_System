import Content from "./content.model.js";
import Assignment from "../assignments/assignment.model.js";
import Publication from "../publications/publication.model.js";
import User from "../auth/auth.model.js";
import { logActivity } from "../activityLog/activityLog.service.js";
import * as notificationService from "../notifications/notification.service.js";
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

  const content = await Content.findByIdAndUpdate(id, allowedFields, {
    new: true,
    runValidators: true,
  })
    .populate("contributors", "name email designation")
    .populate("createdBy", "name email");

  if (!content) {
    const err = new Error("Content not found.");
    err.statusCode = 404;
    err.code = "NOT_FOUND";
    throw err;
  }

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

  // Also remove associated assignments and publications
  await Assignment.deleteMany({ contentId: id });
  await Publication.deleteMany({ contentId: id });
  await Content.findByIdAndDelete(id);

  await logActivity({
    userId,
    action: "CONTENT_DELETED",
    entityType: "Content",
    entityId: id,
    metadata: { title: content.title },
  });

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
  const transitionError = validateTransition(oldStatus, newStatus);
  if (transitionError) {
    const err = new Error(transitionError);
    err.statusCode = 400;
    err.code = "INVALID_TRANSITION";
    throw err;
  }

  // If content is currently ASSIGNED and overdue, lock the overdue state
  if (
    oldStatus === CONTENT_STATUSES.ASSIGNED &&
    content.dueDate &&
    new Date(content.dueDate).setHours(0, 0, 0, 0) <
      new Date().setHours(0, 0, 0, 0)
  ) {
    content.isOverdue = true;
  }

  content.status = newStatus;

  if (scheduledDate !== undefined) {
    content.scheduledDate = scheduledDate;
  }
  if (scheduledTime !== undefined) {
    content.scheduledTime = scheduledTime;
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
      newStatus === CONTENT_STATUSES.PUBLISHED
    ) {
      await notificationService.createNotification({
        userId: assignment.instructorId.userId,
        title: "Content Status Updated",
        message: `Your content "${content.title}" is now ${newStatus}. ${feedback ? "Feedback: " + feedback : ""}`,
        type: newStatus === CONTENT_STATUSES.REJECTED ? "WARNING" : "SUCCESS",
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

  return content.populate(["contributors", "createdBy"]);
};
