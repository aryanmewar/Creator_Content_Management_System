import { Router } from 'express';
import * as assignmentController from './assignment.controller.js';
import protect from '../../middleware/authMiddleware.js';
import validate from '../../middleware/validateMiddleware.js';
import { createAssignmentSchema, updateAssignmentSchema } from './assignment.validation.js';

const router = Router();
router.use(protect);

router.get('/', assignmentController.getAssignments);
router.post('/', validate(createAssignmentSchema), assignmentController.createAssignment);
router.get('/:id', assignmentController.getAssignmentById);
router.put('/:id', validate(updateAssignmentSchema), assignmentController.updateAssignment);

export default router;
