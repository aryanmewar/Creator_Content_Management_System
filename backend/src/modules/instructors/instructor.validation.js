import { z } from "zod";

export const createInstructorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  designation: z.string().max(100).optional().default("Instructor"),
});

export const updateInstructorSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email("Invalid email address").optional(),
  designation: z.string().max(100).optional(),
  password: z.string().min(6).optional(),
});

export const statusSchema = z.object({
  isActive: z.boolean({ required_error: "isActive (boolean) is required" }),
});
