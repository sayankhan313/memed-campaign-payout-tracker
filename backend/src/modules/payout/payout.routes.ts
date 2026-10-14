
import { Router } from 'express';
import { requireAuth } from '../../middlewares/authenticate.middleware.js';
import { requireRole } from '../../middlewares/authorize.middleware.js';
import {
  updateViewsController,
  simulateDemoViewsController,
  getCreatorEarningsController,
} from './payout.controller.js';

const router = Router();

router.patch('/submissions/:id/views', updateViewsController);

router.patch(
  '/demo/submissions/:id/views',
  requireAuth,
  requireRole('creator'),
  simulateDemoViewsController,
);

router.get(
  '/earnings/me',
  requireAuth,
  requireRole('creator'),
  getCreatorEarningsController,
);

export default router;
