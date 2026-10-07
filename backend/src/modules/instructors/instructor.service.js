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
    .limit(parseInt(limit))
    .lean();

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
  const user = await User.findOne({ email: instructor.email })
    .select("_id lastLoginAt role")
    .lean();
  const query = { $or: [{ contributors: instructor._id }] };
  if (user) {
    query.$or.push({ createdBy: user._id, contributors: { $size: 0 } });
  }

  const contentItems = await Content.find(query)
    .select("status isOverdue dueDate")
    .lean();
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
      c.isOverdue ||
      (!["PUBLISHED", "APPROVED", "SCHEDULED", "COMPLETED", "SUBMITTED"].includes(c.status) &&
        c.dueDate &&
        new Date(c.dueDate) < today)
    ) {
      overdue++;
      continue;
    }
    pending++;
  }

  const instObj = typeof instructor.toObject === "function" ? instructor.toObject() : instructor;

  return {
    ...instObj,
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
  if (user) {
    query.$or.push({ createdBy: user._id, contributors: { $size: 0 } });
  }

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
export const createInstructor = async (data, user) => {
  if (
    data.role &&
    (data.role === "ADMIN" || data.role === "SUPER_ADMIN") &&
    user.role !== "ADMIN" &&
    user.role !== "SUPER_ADMIN"
  ) {
    const err = new Error("You are not authorized to create administrator accounts.");
    err.statusCode = 403;
    err.code = "FORBIDDEN";
    throw err;
  }

  const existing = await Instructor.findOne({ email: data.email });
  if (existing) {
    const err = new Error("An instructor with this email already exists.");
    err.statusCode = 409;
    err.code = "EMAIL_EXISTS";
    throw err;
  }

  // Auto-generate password if not provided
  const finalPassword =
    data.password || Math.random().toString(36).slice(-8) + "A1!";

  const newUser = await User.create({
    name: data.name,
    email: data.email,
    passwordHash: finalPassword,
    role: data.role || USER_ROLES.CONTRIBUTOR,
  });

  const instructor = await Instructor.create({
    ...data,
    userId: newUser._id,
    createdBy: user._id,
  });

  await logActivity({
    userId: user._id,
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
export const updateInstructor = async (id, data, user) => {
  const currentInstructor = await Instructor.findById(id);
  if (!currentInstructor) {
    const err = new Error("Instructor not found.");
    err.statusCode = 404;
    err.code = "NOT_FOUND";
    throw err;
  }

  // Find associated target user
  const targetUser = currentInstructor.userId
    ? await User.findById(currentInstructor.userId)
    : await User.findOne({ email: currentInstructor.email });

  if (targetUser) {
    if (targetUser.role === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN") {
      const err = new Error("Only super administrators can modify a super administrator account.");
      err.statusCode = 403;
      err.code = "FORBIDDEN";
      throw err;
    }
    if (
      targetUser.role === "ADMIN" &&
      user.role !== "ADMIN" &&
      user.role !== "SUPER_ADMIN"
    ) {
      const err = new Error("You are not authorized to modify an administrator account.");
      err.statusCode = 403;
      err.code = "FORBIDDEN";
      throw err;
    }
  }

  if (
    data.role &&
    (data.role === "ADMIN" || data.role === "SUPER_ADMIN") &&
    user.role !== "ADMIN" &&
    user.role !== "SUPER_ADMIN"
  ) {
    const err = new Error("You are not authorized to assign administrator privileges.");
    err.statusCode = 403;
    err.code = "FORBIDDEN";
    throw err;
  }

  if (data.role === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN") {
    const err = new Error("Only super administrators can assign the SUPER_ADMIN role.");
    err.statusCode = 403;
    err.code = "FORBIDDEN";
    throw err;
  }

  if (data.password && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    const err = new Error("You are not authorized to change another user's password.");
    err.statusCode = 403;
    err.code = "FORBIDDEN";
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
    const userQuery = currentInstructor.userId
      ? { _id: currentInstructor.userId }
      : { email: currentInstructor.email };
    let linkedUser = await User.findOne(userQuery);

    if (linkedUser) {
      if (data.email) linkedUser.email = data.email;
      if (data.password) linkedUser.passwordHash = data.password; // hashed in pre('save')
      if (data.name) linkedUser.name = data.name;
      if (data.role) linkedUser.role = data.role;
      await linkedUser.save();
    } else if (data.password || data.role) {
      // If no user exists but they provided a password or role, create the user
      linkedUser = await User.create({
        name: data.name || currentInstructor.name,
        email: data.email || currentInstructor.email,
        passwordHash:
          data.password || Math.random().toString(36).slice(-8) + "A1!",
        role: data.role || USER_ROLES.CONTRIBUTOR,
      });
      // Link the new user to the instructor
      instructor.userId = linkedUser._id;
      await instructor.save();
    }
  }

  await logActivity({
    userId: user._id,
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
export const updateInstructorStatus = async (id, isActive, user) => {
  const currentInstructor = await Instructor.findById(id);
  if (!currentInstructor) {
    const err = new Error("Instructor not found.");
    err.statusCode = 404;
    err.code = "NOT_FOUND";
    throw err;
  }

  if (
    currentInstructor.userId &&
    currentInstructor.userId.toString() === user._id.toString()
  ) {
    const err = new Error("You cannot change the active status of your own account.");
    err.statusCode = 403;
    err.code = "FORBIDDEN";
    throw err;
  }

  if (currentInstructor.userId) {
    const targetUser = await User.findById(currentInstructor.userId);
    if (
      targetUser &&
      (targetUser.role === "ADMIN" || targetUser.role === "SUPER_ADMIN") &&
      user.role !== "ADMIN" &&
      user.role !== "SUPER_ADMIN"
    ) {
      const err = new Error("You are not authorized to change the status of an administrator.");
      err.statusCode = 403;
      err.code = "FORBIDDEN";
      throw err;
    }
  }

  const instructor = await Instructor.findByIdAndUpdate(
    id,
    { isActive },
    { new: true },
  ).populate("createdBy", "name email");

  await logActivity({
    userId: user._id,
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
export const deleteInstructor = async (id, user) => {
  const instructor = await Instructor.findById(id);

  if (!instructor) {
    const err = new Error("Instructor not found.");
    err.statusCode = 404;
    err.code = "NOT_FOUND";
    throw err;
  }

  // Deleting instructors is strictly restricted to ADMIN and SUPER_ADMIN
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    const err = new Error("Only administrators can delete instructor accounts.");
    err.statusCode = 403;
    err.code = "FORBIDDEN";
    throw err;
  }

  if (
    instructor.userId &&
    instructor.userId.toString() === user._id.toString()
  ) {
    const err = new Error("You cannot delete your own account.");
    err.statusCode = 403;
    err.code = "FORBIDDEN";
    throw err;
  }

  if (instructor.userId) {
    const targetUser = await User.findById(instructor.userId);
    if (targetUser && targetUser.role === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN") {
      const err = new Error("Cannot delete a super administrator account.");
      err.statusCode = 403;
      err.code = "FORBIDDEN";
      throw err;
    }
    await User.findByIdAndDelete(instructor.userId);
  }

  // Delete assignments for this instructor
  await Assignment.deleteMany({ instructorId: id });

  // Delete the instructor profile
  await Instructor.findByIdAndDelete(id);

  await logActivity({
    userId: user._id,
    action: "INSTRUCTOR_DELETED",
    entityType: "Instructor",
    entityId: id,
    metadata: { name: instructor.name, email: instructor.email },
  });

  return true;
};
