import { Router } from 'express';
import * as scheduleController from './schedule.controller.js';
import protect from '../../middleware/authMiddleware.js';
import validate from '../../middleware/validateMiddleware.js';
import { createScheduleSchema, updateScheduleSchema } from './schedule.validation.js';

const router = Router();
router.use(protect);

router.get('/', scheduleController.getSchedules);
router.post('/', validate(createScheduleSchema), scheduleController.createSchedule);
router.get('/:id', scheduleController.getScheduleById);
router.put('/:id', validate(updateScheduleSchema), scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);

export default router;
