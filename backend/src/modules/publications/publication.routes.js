import { Router } from 'express';
import * as publicationController from './publication.controller.js';
import protect from '../../middleware/authMiddleware.js';
import { z } from 'zod';
import validate from '../../middleware/validateMiddleware.js';
import { PLATFORMS } from '../../utils/statusUtils.js';

const createPublicationSchema = z.object({
  contentId: z.string().min(1, 'Content is required'),
  platform: z.enum(PLATFORMS),
  publishedAt: z.coerce.date({ required_error: 'Published date is required' }),
  postUrl: z.string().url('Must be a valid URL'),
  notes: z.string().max(500).optional().nullable(),
});

const updatePublicationSchema = z.object({
  postUrl: z.string().url('Must be a valid URL').optional(),
  publishedAt: z.coerce.date().optional(),
  notes: z.string().max(500).optional().nullable(),
});

const router = Router();
router.use(protect);

router.get('/', publicationController.getPublications);
router.post('/', validate(createPublicationSchema), publicationController.createPublication);
router.get('/:id', publicationController.getPublicationById);
router.put('/:id', validate(updatePublicationSchema), publicationController.updatePublication);

export default router;
