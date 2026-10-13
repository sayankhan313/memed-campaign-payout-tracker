
import { Router } from 'express';
import { requireAuth } from '../../middlewares/authenticate.middleware.js';
import { requireRole } from '../../middlewares/authorize.middleware.js';
import {
  updateViewsController,
  getCreatorEarningsController,
} from './payout.controller.js';

const router = Router();

router.patch('/submissions/:id/views', updateViewsController);
router.get('/earnings/me', requireAuth, requireRole('creator'), getCreatorEarningsController);

export default router;
