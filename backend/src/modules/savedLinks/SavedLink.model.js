import mongoose from "mongoose";

const savedLinkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      trim: true,
    },
    link: {
      type: String,
      required: [true, "Please provide a link"],
      trim: true,
    },
    assignee: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const SavedLink = mongoose.model("SavedLink", savedLinkSchema);

export default SavedLink;
