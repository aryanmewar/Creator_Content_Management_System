import mongoose from "mongoose";

const overdueRecordSchema = new mongoose.Schema(
  {
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
      required: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
      required: true,
    },
    monthYear: {
      type: String, // Format: "YYYY-MM"
      required: true,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Prevent duplicate records for the same content and instructor in a single month
overdueRecordSchema.index(
  { contentId: 1, instructorId: 1, monthYear: 1 },
  { unique: true },
);
overdueRecordSchema.index({ monthYear: 1 });
overdueRecordSchema.index({ instructorId: 1, monthYear: 1 });

const OverdueRecord = mongoose.model("OverdueRecord", overdueRecordSchema);
export default OverdueRecord;
