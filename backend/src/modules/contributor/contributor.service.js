import Assignment from "../assignments/assignment.model.js";
import Instructor from "../instructors/instructor.model.js";
import Content from "../content/content.model.js";

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

  const [totalAssigned, inProgress, pendingReview, published, overdue] =
    await Promise.all([
      Content.countDocuments({ contributors: instructor._id, status: { $ne: "DRAFT" } }),
      Content.countDocuments({
        contributors: instructor._id,
        status: { $in: ["ASSIGNED", "IN_PROGRESS", "REJECTED"] },
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
        completionDate: { $lt: new Date() },
        status: { $nin: ["PUBLISHED", "APPROVED", "SCHEDULED"] },
      }),
    ]);

  return {
    totalAssigned,
    inProgress,
    pendingReview,
    published,
    overdue,
  };
};

/**
 * GET /api/contributor/assignments
 */
export const getAssignments = async (userId) => {
  const instructor = await getInstructorForUser(userId);

  const contentItems = await Content.find({ contributors: instructor._id, status: { $ne: "DRAFT" } })
    .select("title contentType status completionDate updatedAt")
    .sort({ completionDate: 1 });

  return contentItems.map((c) => ({
    _id: c._id,
    contentId: {
      title: c.title,
      contentType: Array.isArray(c.contentType) ? c.contentType.join(", ") : c.contentType,
      status: c.status,
    },
    deadline: c.completionDate,
    status: c.status,
    submittedAt: ["SUBMITTED", "APPROVED", "SCHEDULED", "PUBLISHED"].includes(c.status) ? c.updatedAt : null,
  }));
};

/**
 * GET /api/contributor/report
 */
export const getReport = async (userId) => {
  const instructor = await getInstructorForUser(userId);

  const contentItems = await Content.find({ contributors: instructor._id, status: { $ne: "DRAFT" } })
    .sort({ completionDate: 1 });

  const assignments = contentItems.map((c) => ({
    _id: c._id,
    contentId: {
      title: c.title,
      contentType: Array.isArray(c.contentType) ? c.contentType.join(", ") : c.contentType,
      status: c.status,
    },
    deadline: c.completionDate,
    status: c.status,
    submittedAt: ["SUBMITTED", "APPROVED", "SCHEDULED", "PUBLISHED"].includes(c.status) ? c.updatedAt : null,
  }));

  // Compute a simple performance report
  const total = assignments.length;
  const published = assignments.filter((a) => a.status === "PUBLISHED").length;
  const overdue = assignments.filter(
    (a) =>
      a.deadline < new Date() &&
      !["PUBLISHED", "APPROVED", "SCHEDULED"].includes(a.status),
  ).length;

  // Calculate on-time rate
  const completed = assignments.filter((a) =>
    ["PUBLISHED", "APPROVED", "SCHEDULED"].includes(a.status),
  );
  const onTime = completed.filter(
    (a) => a.submittedAt && a.submittedAt <= a.deadline,
  ).length;
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
