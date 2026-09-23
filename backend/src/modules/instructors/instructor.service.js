import Instructor from './instructor.model.js';
import Assignment from '../assignments/assignment.model.js';
import Content from '../content/content.model.js';
import User from '../auth/auth.model.js';
import { logActivity } from '../activityLog/activityLog.service.js';
import { getDeadlineState, getStartOfToday } from '../../utils/dateUtils.js';

/**
 * Get paginated, searchable list of instructors.
 */
export const getInstructors = async ({ search, isActive, page = 1, limit = 20 }) => {
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { designation: { $regex: search, $options: 'i' } },
    ];
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true' || isActive === true;
  }

  const skip = (page - 1) * limit;
  const total = await Instructor.countDocuments(query);
  const instructors = await Instructor.find(query)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Attach content stats for each instructor
  const enriched = await Promise.all(instructors.map(enrichInstructorStats));

  return {
    data: enriched,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Attach content count stats to an instructor.
 */
const enrichInstructorStats = async (instructor) => {
  const user = await User.findOne({ email: instructor.email });
  const query = { $or: [{ contributors: instructor._id }] };
  if (user) query.$or.push({ createdBy: user._id });

  const contentItems = await Content.find(query);
  const today = getStartOfToday();

  let total = 0, completed = 0, pending = 0, overdue = 0;

  for (const c of contentItems) {
    total++;
    if (c.status === 'PUBLISHED') { 
      completed++; 
      continue; 
    }
    if (c.completionDate && new Date(c.completionDate) < today) { 
      overdue++; 
      continue; 
    }
    pending++;
  }

  return {
    ...instructor.toObject(),
    stats: { total, completed, pending, overdue },
  };
};

/**
 * Get a single instructor by ID with full profile data.
 */
export const getInstructorById = async (id) => {
  const instructor = await Instructor.findById(id).populate('createdBy', 'name email');
  if (!instructor) {
    const err = new Error('Instructor not found.');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  const user = await User.findOne({ email: instructor.email });
  const query = { $or: [{ contributors: id }] };
  if (user) query.$or.push({ createdBy: user._id });

  const contentItems = await Content.find(query)
    .sort({ createdAt: -1 });

  const today = getStartOfToday();
  const now = new Date();

  const enrichedAssignments = contentItems.map((c) => {
    const deadlineState = getDeadlineState(c.completionDate, c.status);
    return { 
      _id: c._id.toString(),
      contentId: c.toObject(),
      assignedAt: c.createdAt,
      deadline: c.completionDate,
      priority: 'MEDIUM',
      deadlineState 
    };
  });

  return {
    ...instructor.toObject(),
    assignments: enrichedAssignments,
  };
};

/**
 * Create a new instructor.
 */
export const createInstructor = async (data, userId) => {
  const existing = await Instructor.findOne({ email: data.email });
  if (existing) {
    const err = new Error('An instructor with this email already exists.');
    err.statusCode = 409;
    err.code = 'EMAIL_EXISTS';
    throw err;
  }

  const instructor = await Instructor.create({ ...data, createdBy: userId });

  await logActivity({
    userId,
    action: 'INSTRUCTOR_CREATED',
    entityType: 'Instructor',
    entityId: instructor._id,
    metadata: { name: instructor.name, email: instructor.email },
  });

  return instructor;
};

/**
 * Update instructor details.
 */
export const updateInstructor = async (id, data, userId) => {
  if (data.email) {
    const conflict = await Instructor.findOne({ email: data.email, _id: { $ne: id } });
    if (conflict) {
      const err = new Error('This email is already in use by another instructor.');
      err.statusCode = 409;
      err.code = 'EMAIL_EXISTS';
      throw err;
    }
  }

  const instructor = await Instructor.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate('createdBy', 'name email');

  if (!instructor) {
    const err = new Error('Instructor not found.');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  await logActivity({
    userId,
    action: 'INSTRUCTOR_UPDATED',
    entityType: 'Instructor',
    entityId: instructor._id,
    metadata: { updatedFields: Object.keys(data) },
  });

  return instructor;
};

/**
 * Toggle instructor active status (soft deactivation).
 * Preserves all historical content/assignment data.
 */
export const updateInstructorStatus = async (id, isActive, userId) => {
  const instructor = await Instructor.findByIdAndUpdate(
    id,
    { isActive },
    { new: true }
  ).populate('createdBy', 'name email');

  if (!instructor) {
    const err = new Error('Instructor not found.');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  await logActivity({
    userId,
    action: isActive ? 'INSTRUCTOR_ACTIVATED' : 'INSTRUCTOR_DEACTIVATED',
    entityType: 'Instructor',
    entityId: instructor._id,
    metadata: { name: instructor.name },
  });

  return instructor;
};

/**
 * Update profile image URL after Cloudinary upload.
 */
export const updateProfileImage = async (id, imageData, userId) => {
  const instructor = await Instructor.findByIdAndUpdate(
    id,
    { profileImage: imageData },
    { new: true }
  );

  if (!instructor) {
    const err = new Error('Instructor not found.');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  return instructor;
};
