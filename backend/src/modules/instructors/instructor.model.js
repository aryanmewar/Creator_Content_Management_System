import mongoose from "mongoose";

const instructorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Instructor name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    designation: {
      type: String,
      trim: true,
      default: "Instructor",
      maxlength: [100, "Designation cannot exceed 100 characters"],
    },
    profileImage: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Index for search performance
instructorSchema.index({ name: "text", email: "text" });
instructorSchema.index({ isActive: 1 });

const Instructor = mongoose.model("Instructor", instructorSchema);
export default Instructor;
