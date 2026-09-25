import Instructor from "./instructor.model.js";
import Assignment from "../assignments/assignment.model.js";
import Content from "../content/content.model.js";
import User from "../auth/auth.model.js";
import { logActivity } from "../activityLog/activityLog.service.js";
import { getDeadlineState, getStartOfToday } from "../../utils/dateUtils.js";
import { USER_ROLES } from "../../utils/statusUtils.js";

/**
 * Get paginated, searchable list of instructors.
 */
export const getInstructors = async ({
  search,
  isActive,
  page = 1,
  limit = 20,
}) => {
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { designation: { $regex: search, $options: "i" } },
    ];
  }

  if (isActive !== undefined) {
    query.isActive = isActive === "true" || isActive === true;
  }

  const skip = (page - 1) * limit;
  const total = await Instructor.countDocuments(query);
  const instructors = await Instructor.find(query)
    .populate("createdBy", "name email")
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

  let total = 0,
    completed = 0,
    pending = 0,
    overdue = 0;

  for (const c of contentItems) {
    total++;
    if (c.status === "PUBLISHED") {
      completed++;
      continue;
    }
    if (
      c.completionDate && 
      new Date(c.completionDate) < today &&
      ["ASSIGNED", "DRAFT"].includes(c.status)
    ) {
      overdue++;
      continue;
    }
    pending++;
  }

  return {
    ...instructor.toObject(),
    lastLoginAt: user ? user.lastLoginAt : null,
    role: user ? user.role : USER_ROLES.CONTRIBUTOR,
    stats: { total, completed, pending, overdue },
  };
};

/**
 * Get a single instructor by ID with full profile data.
 */
export const getInstructorById = async (id) => {
  const instructor = await Instructor.findById(id).populate(
    "createdBy",
    "name email",
  );
  if (!instructor) {
    const err = new Error("Instructor not found.");
    err.statusCode = 404;
    err.code = "NOT_FOUND";
    throw err;
  }

  const user = await User.findOne({ email: instructor.email });
  const query = { $or: [{ contributors: id }] };
  if (user) query.$or.push({ createdBy: user._id });

  const contentItems = await Content.find(query).sort({ createdAt: -1 });

  const today = getStartOfToday();
  const now = new Date();

  const enrichedAssignments = contentItems.map((c) => {
    const deadlineState = getDeadlineState(c.completionDate, c.status);
    return {
      _id: c._id.toString(),
      contentId: c.toObject(),
      assignedAt: c.createdAt,
      deadline: c.completionDate,
      priority: "MEDIUM",
      deadlineState,
    };
  });

  return {
    ...instructor.toObject(),
    lastLoginAt: user ? user.lastLoginAt : null,
    role: user ? user.role : USER_ROLES.CONTRIBUTOR,
    assignments: enrichedAssignments,
  };
};

/**
 * Create a new instructor.
 */
export const createInstructor = async (data, userId) => {
  const existing = await Instructor.findOne({ email: data.email });
  if (existing) {
    const err = new Error("An instructor with this email already exists.");
    err.statusCode = 409;
    err.code = "EMAIL_EXISTS";
    throw err;
  }

  // Auto-generate password if not provided
  const finalPassword = data.password || Math.random().toString(36).slice(-8) + "A1!";

  const user = await User.create({
    name: data.name,
    email: data.email,
    passwordHash: finalPassword,
    role: data.role || USER_ROLES.CONTRIBUTOR,
  });

  const instructor = await Instructor.create({
    ...data,
    userId: user._id,
    createdBy: userId,
  });

  await logActivity({
    userId,
    action: "INSTRUCTOR_CREATED",
    entityType: "Instructor",
    entityId: instructor._id,
    metadata: { name: instructor.name, email: instructor.email },
  });

  return instructor;
};

/**
 * Update instructor details.
 */
export const updateInstructor = async (id, data, userId) => {
  const currentInstructor = await Instructor.findById(id);
  if (!currentInstructor) {
    const err = new Error("Instructor not found.");
    err.statusCode = 404;
    err.code = "NOT_FOUND";
    throw err;
  }

  if (data.email) {
    const conflict = await Instructor.findOne({
      email: data.email,
      _id: { $ne: id },
    });
    if (conflict) {
      const err = new Error(
        "This email is already in use by another instructor.",
      );
      err.statusCode = 409;
      err.code = "EMAIL_EXISTS";
      throw err;
    }
  }

  const instructor = await Instructor.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("createdBy", "name email");

  // Sync with User model if needed
  if (data.email || data.password || data.role) {
    // Find associated user by userId or fallback to original email
    const userQuery = currentInstructor.userId ? { _id: currentInstructor.userId } : { email: currentInstructor.email };
    let user = await User.findOne(userQuery);
    
    if (user) {
      if (data.email) user.email = data.email;
      if (data.password) user.passwordHash = data.password; // hashed in pre('save')
      if (data.name) user.name = data.name;
      if (data.role) user.role = data.role;
      await user.save();
    } else if (data.password || data.role) {
      // If no user exists but they provided a password or role, create the user
      user = await User.create({
        name: data.name || currentInstructor.name,
        email: data.email || currentInstructor.email,
        passwordHash: data.password || Math.random().toString(36).slice(-8) + "A1!",
        role: data.role || USER_ROLES.CONTRIBUTOR,
      });
      // Link the new user to the instructor
      instructor.userId = user._id;
      await instructor.save();
    }
  }

  await logActivity({
    userId,
    action: "INSTRUCTOR_UPDATED",
    entityType: "Instructor",
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
    { new: true },
  ).populate("createdBy", "name email");

  if (!instructor) {
    const err = new Error("Instructor not found.");
    err.statusCode = 404;
    err.code = "NOT_FOUND";
    throw err;
  }

  await logActivity({
    userId,
    action: isActive ? "INSTRUCTOR_ACTIVATED" : "INSTRUCTOR_DEACTIVATED",
    entityType: "Instructor",
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
    { new: true },
  );

  if (!instructor) {
    const err = new Error("Instructor not found.");
    err.statusCode = 404;
    err.code = "NOT_FOUND";
    throw err;
  }

  return instructor;
};

/**
 * Delete an instructor and associated user account.
 */
export const deleteInstructor = async (id, userId) => {
  const instructor = await Instructor.findById(id);

  if (!instructor) {
    const err = new Error("Instructor not found.");
    err.statusCode = 404;
    err.code = "NOT_FOUND";
    throw err;
  }

  // Delete associated user account if it exists
  if (instructor.userId) {
    await User.findByIdAndDelete(instructor.userId);
  }

  // Delete assignments for this instructor
  await Assignment.deleteMany({ instructorId: id });

  // Delete the instructor profile
  await Instructor.findByIdAndDelete(id);

  await logActivity({
    userId,
    action: "INSTRUCTOR_DELETED",
    entityType: "Instructor",
    entityId: id,
    metadata: { name: instructor.name, email: instructor.email },
  });

  return true;
};