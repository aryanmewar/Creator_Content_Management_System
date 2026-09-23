import { Router } from 'express';
import * as instructorController from './instructor.controller.js';
import protect from '../../middleware/authMiddleware.js';
import validate from '../../middleware/validateMiddleware.js';
import { uploadSingle } from '../../middleware/uploadMiddleware.js';
import {
  createInstructorSchema,
  updateInstructorSchema,
  statusSchema,
} from './instructor.validation.js';

const router = Router();

// All instructor routes require authentication
router.use(protect);

router.get('/', instructorController.getInstructors);
router.post('/', ...uploadSingle('profileImage'), validate(createInstructorSchema), instructorController.createInstructor);
router.get('/:id', instructorController.getInstructorById);
router.put('/:id', ...uploadSingle('profileImage'), validate(updateInstructorSchema), instructorController.updateInstructor);
router.patch('/:id/status', validate(statusSchema), instructorController.updateInstructorStatus);

export default router;
