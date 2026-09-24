import { z } from "zod";
import { PLATFORMS } from "../../utils/statusUtils.js";

export const createScheduleSchema = z.object({
  contentId: z.string().min(1, "Content is required"),
  platform: z.enum(PLATFORMS, {
    errorMap: () => ({ message: "Invalid platform" }),
  }),
  scheduledDate: z.coerce.date({
    required_error: "Scheduled date is required",
  }),
  scheduledTime: z
    .string()
    .regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:MM format"),
  notes: z.string().max(500).optional().nullable(),
});

export const updateScheduleSchema = z.object({
  scheduledDate: z.coerce.date().optional(),
  scheduledTime: z
    .string()
    .regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:MM format")
    .optional(),
  status: z
    .enum(["SCHEDULED", "PUBLISHED", "CANCELLED", "RESCHEDULED"])
    .optional(),
  notes: z.string().max(500).optional().nullable(),
});
