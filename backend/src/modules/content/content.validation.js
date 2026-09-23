import { z } from 'zod';
import { CONTENT_TYPES, CONTENT_STATUSES } from '../../utils/statusUtils.js';

export const createContentSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  referenceLink: z.string().url('Must be a valid URL').optional().nullable(),
  contentType: z.array(z.string()).min(1, 'Select at least one content type'),
  contributors: z.array(z.string()).optional(),
  dueDate: z.string().or(z.date()).refine(val => !val || !isNaN(new Date(val).getTime()), { message: 'Invalid due date' }).optional().nullable(),
  completionDate: z.string().or(z.date()).refine(val => !isNaN(new Date(val).getTime()), { message: 'Invalid completion date' }),
  notes: z.string().max(2000).optional().nullable(),
  isOwnerContent: z.boolean().optional(),
});

export const updateContentSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  referenceLink: z.string().url('Must be a valid URL').optional().nullable(),
  contentType: z.array(z.string()).min(1).optional(),
  contributors: z.array(z.string()).optional(),
  dueDate: z.string().or(z.date()).refine(val => !val || !isNaN(new Date(val).getTime())).optional().nullable(),
  completionDate: z.string().or(z.date()).refine(val => !isNaN(new Date(val).getTime())).optional(),
  notes: z.string().max(2000).optional().nullable(),
  scheduledDate: z.string().or(z.date()).refine(val => !val || !isNaN(new Date(val).getTime())).optional().nullable(),
  publishedLinks: z.object({
    youtube: z.string().url('Must be a valid URL').or(z.literal('')).optional().nullable(),
    instagram: z.string().url('Must be a valid URL').or(z.literal('')).optional().nullable(),
    linkedin: z.string().url('Must be a valid URL').or(z.literal('')).optional().nullable(),
    facebook: z.string().url('Must be a valid URL').or(z.literal('')).optional().nullable(),
  }).optional().nullable(),
  publishedDate: z.string().or(z.date()).refine(val => !val || !isNaN(new Date(val).getTime())).optional().nullable(),
  isOwnerContent: z.boolean().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(Object.values(CONTENT_STATUSES), {
    errorMap: () => ({ message: 'Invalid status value' }),
  }),
  feedback: z.string().max(500).optional().nullable(),
  scheduledDate: z.string().or(z.date()).refine(val => !val || !isNaN(new Date(val).getTime())).optional().nullable(),
  publishedLinks: z.object({
    youtube: z.string().url('Must be a valid URL').or(z.literal('')).optional().nullable(),
    instagram: z.string().url('Must be a valid URL').or(z.literal('')).optional().nullable(),
    linkedin: z.string().url('Must be a valid URL').or(z.literal('')).optional().nullable(),
    facebook: z.string().url('Must be a valid URL').or(z.literal('')).optional().nullable(),
  }).optional().nullable(),
  publishedDate: z.string().or(z.date()).refine(val => !val || !isNaN(new Date(val).getTime())).optional().nullable(),
});

export const contentQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  contentType: z.string().optional(),
  instructor: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});
