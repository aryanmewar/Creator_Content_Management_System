import mongoose from 'mongoose';
import { PLATFORMS } from '../../utils/statusUtils.js';

const publicationSchema = new mongoose.Schema(
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
    publishedAt: {
      type: Date,
      required: [true, 'Published date is required'],
    },
    postUrl: {
      type: String,
      required: [true, 'Post URL is required'],
      trim: true,
      validate: {
        validator: (v) => /^https?:\/\/.+/.test(v),
        message: 'Post URL must be a valid URL',
      },
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

publicationSchema.index({ contentId: 1, platform: 1 });
publicationSchema.index({ publishedAt: -1 });

const Publication = mongoose.model('Publication', publicationSchema);
export default Publication;
