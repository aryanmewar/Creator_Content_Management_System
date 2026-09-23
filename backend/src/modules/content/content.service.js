import Content from './content.model.js';
import Assignment from '../assignments/assignment.model.js';
import Publication from '../publications/publication.model.js';
import { logActivity } from '../activityLog/activityLog.service.js';
import { validateTransition, CONTENT_STATUSES } from '../../utils/statusUtils.js';
import { getDeadlineState } from '../../utils/dateUtils.js';

/**
 * Get paginated, filtered, searchable content list.
 */
export const getContent = async ({ search, status, contentType, instructor, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', dateFrom, dateTo }) => {
  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } },
    ];
  }
  if (status) query.status = status;
  if (contentType) query.contentType = contentType;
  if (instructor) query.contributors = instructor;
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  const skip = (page - 1) * limit;
  const total = await Content.countDocuments(query);

  const content = await Content.find(query)
    .populate('contributors', 'name email designation profileImage')
    .populate('createdBy', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  // Attach assignment deadline info
  const enriched = await Promise.all(content.map(enrichContentWithDeadline));

  return {
    data: enriched,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Attach the latest assignment deadline and deadline state to content.
 */
const enrichContentWithDeadline = async (content) => {
  const assignment = await Assignment.findOne({ contentId: content._id }).sort({ createdAt: -1 });
  const deadlineState = assignment
    ? getDeadlineState(assignment.deadline, content.status)
    : null;

  return {
    ...content.toObject(),
    assignment: assignment ? {
      deadline: assignment.deadline,
      priority: assignment.priority,
      deadlineState,
    } : null,
  };
};

/**
 * Get single content item by ID.
 */
export const getContentById = async (id) => {
  const content = await Content.findById(id)
    .populate('contributors', 'name email designation profileImage')
    .populate('createdBy', 'name email');

  if (!content) {
    const err = new Error('Content not found.');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
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
  const content = await Content.create({ ...data, createdBy: userId, status: CONTENT_STATUSES.DRAFT });

  await logActivity({
    userId,
    action: 'CONTENT_CREATED',
    entityType: 'Content',
    entityId: content._id,
    metadata: { title: content.title, contentType: content.contentType },
  });

  return content.populate(['contributors', 'createdBy']);
};

/**
 * Update content fields (does NOT change status — use updateContentStatus for that).
 */
export const updateContent = async (id, data, userId) => {
  // Don't allow status change via regular update
  delete data.status;

  const content = await Content.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate('contributors', 'name email designation')
    .populate('createdBy', 'name email');

  if (!content) {
    const err = new Error('Content not found.');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  await logActivity({
    userId,
    action: 'CONTENT_UPDATED',
    entityType: 'Content',
    entityId: content._id,
    metadata: { title: content.title, updatedFields: Object.keys(data) },
  });

  return content;
};

/**
 * Delete content — only allowed for DRAFT or when no publications exist.
 */
export const deleteContent = async (id, userId) => {
  const content = await Content.findById(id);
  if (!content) {
    const err = new Error('Content not found.');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  // Also remove associated assignments and publications
  await Assignment.deleteMany({ contentId: id });
  await Publication.deleteMany({ contentId: id });
  await Content.findByIdAndDelete(id);

  await logActivity({
    userId,
    action: 'CONTENT_DELETED',
    entityType: 'Content',
    entityId: id,
    metadata: { title: content.title },
  });

  return true;
};

/**
 * Update content status — enforces transition map.
 */
export const updateContentStatus = async (id, newStatus, userId, feedback = null, scheduledDate = undefined, publishedLinks = undefined, publishedDate = undefined) => {
  const content = await Content.findById(id);
  if (!content) {
    const err = new Error('Content not found.');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  content.status = newStatus;
  
  if (scheduledDate !== undefined) {
    content.scheduledDate = scheduledDate;
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
      { status: 'SUBMITTED', submittedAt: new Date() }
    );
  }
  if (newStatus === CONTENT_STATUSES.APPROVED) {
    await Assignment.findOneAndUpdate({ contentId: id }, { status: 'APPROVED' });
  }
  if (newStatus === CONTENT_STATUSES.REJECTED) {
    await Assignment.findOneAndUpdate({ contentId: id }, { status: 'REJECTED', feedback });
  }

  await logActivity({
    userId,
    action: 'STATUS_CHANGED',
    entityType: 'Content',
    entityId: content._id,
    metadata: { title: content.title, from: content.status, to: newStatus, feedback },
  });

  return content.populate(['contributors', 'createdBy']);
};
