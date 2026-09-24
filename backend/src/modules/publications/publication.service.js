import Publication from "./publication.model.js";
import Content from "../content/content.model.js";
import Schedule from "../schedules/schedule.model.js";
import { logActivity } from "../activityLog/activityLog.service.js";
import { CONTENT_STATUSES } from "../../utils/statusUtils.js";

/**
 * Get paginated publication history.
 */
export const getPublications = async ({
  contentId,
  platform,
  page = 1,
  limit = 20,
}) => {
  const query = {};
  if (contentId) query.contentId = contentId;
  if (platform) query.platform = platform;

  const total = await Publication.countDocuments(query);
  const publications = await Publication.find(query)
    .populate("contentId", "title contentType")
    .populate("publishedBy", "name email")
    .sort({ publishedAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  return {
    data: publications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get single publication by ID.
 */
export const getPublicationById = async (id) => {
  const pub = await Publication.findById(id)
    .populate("contentId", "title contentType")
    .populate("publishedBy", "name email");
  if (!pub) {
    const err = new Error("Publication not found.");
    err.statusCode = 404;
    err.code = "NOT_FOUND";
    throw err;
  }
  return pub;
};

/**
 * Log a publication record.
 * After saving, marks associated schedule as PUBLISHED and
 * if all required platforms are published, marks content as PUBLISHED.
 */
export const createPublication = async (data, userId) => {
  const { contentId, platform, publishedAt, postUrl, notes } = data;

  const content = await Content.findById(contentId);
  if (!content) {
    const err = new Error("Content not found.");
    err.statusCode = 404;
    err.code = "CONTENT_NOT_FOUND";
    throw err;
  }

  const pub = await Publication.create({
    contentId,
    platform,
    publishedAt,
    postUrl,
    notes,
    publishedBy: userId,
  });

  // Mark schedule as PUBLISHED for this platform
  await Schedule.findOneAndUpdate(
    { contentId, platform, isActive: true },
    { status: "PUBLISHED", isActive: false },
  );

  // Move content to PUBLISHED status
  if (
    content.status === CONTENT_STATUSES.SCHEDULED ||
    content.status === CONTENT_STATUSES.APPROVED
  ) {
    content.status = CONTENT_STATUSES.PUBLISHED;
    await content.save();
  }

  await logActivity({
    userId,
    action: "CONTENT_PUBLISHED",
    entityType: "Publication",
    entityId: pub._id,
    metadata: { contentTitle: content.title, platform, postUrl, publishedAt },
  });

  return pub.populate(["contentId", "publishedBy"]);
};

/**
 * Update a publication record (e.g., fix URL).
 */
export const updatePublication = async (id, data, userId) => {
  const pub = await Publication.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .populate("contentId", "title contentType")
    .populate("publishedBy", "name email");

  if (!pub) {
    const err = new Error("Publication not found.");
    err.statusCode = 404;
    err.code = "NOT_FOUND";
    throw err;
  }
  return pub;
};
