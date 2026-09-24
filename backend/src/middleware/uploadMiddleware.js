import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import env from "../config/env.js";
import { sendError } from "../utils/response.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

// Use memory storage — we'll stream to Cloudinary manually
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/quicktime",
    "application/pdf",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type '${file.mimetype}' is not allowed.`), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

/**
 * Upload a buffer to Cloudinary.
 * @param {Buffer} buffer
 * @param {Object} options - folder, resource_type, etc.
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "content-manager", ...options },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    stream.end(buffer);
  });
};

/**
 * Middleware: upload single file to Cloudinary, attach result to req.uploadedFile
 */
export const uploadSingle = (fieldName = "file") => [
  upload.single(fieldName),
  async (req, res, next) => {
    if (!req.file) return next();

    try {
      const result = await uploadToCloudinary(req.file.buffer, {
        resource_type: req.file.mimetype.startsWith("video")
          ? "video"
          : "image",
      });
      req.uploadedFile = {
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type,
        format: result.format,
        bytes: result.bytes,
      };
      next();
    } catch (error) {
      return sendError(res, {
        message: "File upload failed. Please try again.",
        code: "UPLOAD_FAILED",
        statusCode: 500,
      });
    }
  },
];

export default cloudinary;
