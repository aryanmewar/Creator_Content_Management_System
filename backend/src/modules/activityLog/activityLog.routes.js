import { Router } from 'express';
import * as activityLogService from './activityLog.service.js';
import protect from '../../middleware/authMiddleware.js';
import { sendPaginated } from '../../utils/response.js';

const router = Router();
router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const result = await activityLogService.getActivityLog(req.query);
    return sendPaginated(res, { data: result.data, pagination: result.pagination });
  } catch (error) { next(error); }
});

export default router;
