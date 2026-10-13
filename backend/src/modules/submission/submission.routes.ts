
import { Router } from 'express';
import { requireAuth } from '../../middlewares/authenticate.middleware.js';
import { requireRole } from '../../middlewares/authorize.middleware.js';
import {
  createSubmissionController,
  getCreatorSubmissionsController,
} from './submission.controller.js';

const router = Router();

router.post('/', requireAuth, requireRole('creator'), createSubmissionController);
router.get('/mine', requireAuth, requireRole('creator'), getCreatorSubmissionsController);

export default router;
