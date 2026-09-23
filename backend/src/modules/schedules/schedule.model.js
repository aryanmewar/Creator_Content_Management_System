import mongoose from 'mongoose';
import { PLATFORMS } from '../../utils/statusUtils.js';

const scheduleSchema = new mongoose.Schema(
  {
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content',
      required: [true, 'Content is required'],
    },
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      enum: { values: PLATFORMS, message: 'Invalid platform' },
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    scheduledTime: {
      type: String, // HH:MM format (stored separately for display clarity)
      required: [true, 'Scheduled time is required'],
      match: [/^([0-1]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM format'],
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'PUBLISHED', 'CANCELLED', 'RESCHEDULED'],
      default: 'SCHEDULED',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rescheduledFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

scheduleSchema.index({ contentId: 1, platform: 1, isActive: 1 });
scheduleSchema.index({ scheduledDate: 1 });

const Schedule = mongoose.model('Schedule', scheduleSchema);
export default Schedule;
