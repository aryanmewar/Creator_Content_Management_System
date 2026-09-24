import mongoose from "mongoose";
import { CONTENT_STATUSES, CONTENT_TYPES } from "../../utils/statusUtils.js";

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Content title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    referenceLink: {
      type: String,
      trim: true,
      default: null,
      validate: {
        validator: (v) => !v || /^https?:\/\/.+/.test(v),
        message: "Reference link must be a valid URL",
      },
    },
    contentType: {
      type: [String],
      required: [true, "Content type is required"],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "At least one content type must be selected",
      },
    },
    isOwnerContent: {
      type: Boolean,
      default: true,
    },
    contributors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Instructor",
      },
    ],
    dueDate: {
      type: Date,
      default: null,
    },
    completionDate: {
      type: Date,
      required: [true, "Completion date is required"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(CONTENT_STATUSES),
      default: CONTENT_STATUSES.DRAFT,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    thumbnail: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    scheduledDate: {
      type: Date,
      default: null,
    },
    publishedLinks: {
      youtube: { type: String, default: null, trim: true },
      instagram: { type: String, default: null, trim: true },
      linkedin: { type: String, default: null, trim: true },
      facebook: { type: String, default: null, trim: true },
    },
    publishedDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Text index for full-text search
contentSchema.index({ title: "text", notes: "text" });
contentSchema.index({ status: 1, contentType: 1 });
contentSchema.index({ contributors: 1 });
contentSchema.index({ createdBy: 1 });

const Content = mongoose.model("Content", contentSchema);
export default Content;
