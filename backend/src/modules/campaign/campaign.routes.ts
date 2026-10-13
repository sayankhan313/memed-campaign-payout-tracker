
import { Router } from 'express';
import { requireAuth } from '../../middlewares/authenticate.middleware.js';
import { requireRole } from '../../middlewares/authorize.middleware.js';
import {
  createCampaignController,
  getBrandCampaignsController,
  getLiveCampaignsController,
  getCampaignDetailsController,
  updateCampaignController,
  transitionCampaignController,
  getBrandCampaignSubmissionsController,
} from './campaign.controller.js';

const router = Router();

router.post('/', requireAuth, requireRole('brand'), createCampaignController);
router.get('/mine', requireAuth, requireRole('brand'), getBrandCampaignsController);
router.get('/live', requireAuth, requireRole('creator'), getLiveCampaignsController);
router.get('/:id/submissions', requireAuth, requireRole('brand'), getBrandCampaignSubmissionsController);
router.get('/:id', requireAuth, getCampaignDetailsController);
router.patch('/:id', requireAuth, requireRole('brand'), updateCampaignController);
router.patch('/:id/status', requireAuth, requireRole('brand'), transitionCampaignController);

export default router;
