import { z } from "zod";
import { PRIORITY_LEVELS } from "../../utils/statusUtils.js";

export const createAssignmentSchema = z
  .object({
    contentId: z.string().min(1, "Content is required"),
    instructorId: z.string().min(1, "Instructor is required"),
    assignedAt: z.coerce
      .date()
      .optional()
      .default(() => new Date()),
    deadline: z.coerce.date({ required_error: "Deadline is required" }),
    priority: z.enum(PRIORITY_LEVELS).optional().default("MEDIUM"),
    instructions: z.string().max(2000).optional().nullable(),
  })
  .refine((data) => new Date(data.deadline) >= new Date(data.assignedAt), {
    message: "Deadline cannot be before the assignment date.",
    path: ["deadline"],
  });

export const updateAssignmentSchema = z.object({
  deadline: z.coerce.date().optional(),
  priority: z.enum(PRIORITY_LEVELS).optional(),
  instructions: z.string().max(2000).optional().nullable(),
  feedback: z.string().max(1000).optional().nullable(),
});
