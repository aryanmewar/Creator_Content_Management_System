import Assignment from './assignment.model.js';
import Content from '../content/content.model.js';
import Instructor from '../instructors/instructor.model.js';
import { logActivity } from '../activityLog/activityLog.service.js';
import { validateTransition, CONTENT_STATUSES } from '../../utils/statusUtils.js';
import { getDeadlineState } from '../../utils/dateUtils.js';

/**
 * Get paginated assignments list.
 */
export const getAssignments = async ({ instructorId, status, page = 1, limit = 20 }) => {
  const query = {};
  if (instructorId) query.instructorId = instructorId;
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const total = await Assignment.countDocuments(query);

  const assignments = await Assignment.find(query)
    .populate('contentId', 'title contentType status')
    .populate('instructorId', 'name email designation profileImage')
    .populate('assignedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const enriched = assignments.map((a) => ({
    ...a.toObject(),
    deadlineState: a.contentId
      ? getDeadlineState(a.deadline, a.contentId.status)
      : null,
  }));

  return {
    data: enriched,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Get single assignment by ID.
 */
export const getAssignmentById = async (id) => {
  const assignment = await Assignment.findById(id)
    .populate('contentId')
    .populate('instructorId', 'name email designation profileImage isActive')
    .populate('assignedBy', 'name email');

  if (!assignment) {
    const err = new Error('Assignment not found.');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  return {
    ...assignment.toObject(),
    deadlineState: assignment.contentId
      ? getDeadlineState(assignment.deadline, assignment.contentId.status)
      : null,
  };
};

/**
 * Assign content to an instructor.
 * Business rules:
 *  - Content must exist
 *  - Instructor must exist and be active
 *  - Content must not already be assigned (status !== DRAFT)
 *  - Deadline >= assignedAt
 */
export const createAssignment = async (data, userId) => {
  const { contentId, instructorId, assignedAt, deadline, priority, instructions } = data;

  // Validate content
  const content = await Content.findById(contentId);
  if (!content) {
    const err = new Error('Content not found.');
    err.statusCode = 404;
    err.code = 'CONTENT_NOT_FOUND';
    throw err;
  }
  if (content.status !== CONTENT_STATUSES.DRAFT) {
    const err = new Error(`Content is already in status '${content.status}' and cannot be reassigned.`);
    err.statusCode = 400;
    err.code = 'CONTENT_ALREADY_ASSIGNED';
    throw err;
  }

  // Validate instructor
  const instructor = await Instructor.findById(instructorId);
  if (!instructor) {
    const err = new Error('Instructor not found.');
    err.statusCode = 404;
    err.code = 'INSTRUCTOR_NOT_FOUND';
    throw err;
  }
  if (!instructor.isActive) {
    const err = new Error('Cannot assign content to an inactive instructor.');
    err.statusCode = 400;
    err.code = 'INSTRUCTOR_INACTIVE';
    throw err;
  }

  // Create assignment
  const assignment = await Assignment.create({
    contentId, instructorId,
    assignedBy: userId,
    assignedAt: assignedAt || new Date(),
    deadline,
    priority: priority || 'MEDIUM',
    instructions,
    status: CONTENT_STATUSES.ASSIGNED,
  });

  // Move content status to ASSIGNED and set instructor
  content.status = CONTENT_STATUSES.ASSIGNED;
  content.instructor = instructorId;
  await content.save();

  await logActivity({
    userId,
    action: 'CONTENT_ASSIGNED',
    entityType: 'Assignment',
    entityId: assignment._id,
    metadata: {
      contentTitle: content.title,
      instructorName: instructor.name,
      deadline,
      priority,
    },
  });

  return assignment.populate(['contentId', 'instructorId', 'assignedBy']);
};

/**
 * Update assignment details (deadline, priority, instructions).
 */
export const updateAssignment = async (id, data, userId) => {
  const assignment = await Assignment.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate('contentId', 'title status')
    .populate('instructorId', 'name email');

  if (!assignment) {
    const err = new Error('Assignment not found.');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  if (data.deadline) {
    await logActivity({
      userId,
      action: 'DEADLINE_CHANGED',
      entityType: 'Assignment',
      entityId: assignment._id,
      metadata: { newDeadline: data.deadline, contentTitle: assignment.contentId?.title },
    });
  }

  return assignment;
};
