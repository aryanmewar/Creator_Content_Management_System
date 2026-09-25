import mongoose from "mongoose";
import { PRIORITY_LEVELS, CONTENT_STATUSES } from "../../utils/statusUtils.js";

const assignmentSchema = new mongoose.Schema(
  {
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
      required: [true, "Content is required"],
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
      required: [true, "Instructor is required"],
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedAt: {
      type: Date,
      required: [true, "Assignment date is required"],
      default: Date.now,
    },
    deadline: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: { values: PRIORITY_LEVELS, message: "Invalid priority level" },
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: Object.values(CONTENT_STATUSES),
      default: CONTENT_STATUSES.ASSIGNED,
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [2000, "Instructions cannot exceed 2000 characters"],
      default: null,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [1000],
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

assignmentSchema.index({ contentId: 1 });
assignmentSchema.index({ instructorId: 1 });
assignmentSchema.index({ deadline: 1, status: 1 });

const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment;
