
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { signupController, loginController, meController } from './auth.controller.js';
import { requireAuth } from '../../middlewares/authenticate.middleware.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please try again later.',
  },
});

router.post('/signup', authLimiter, signupController);
router.post('/login', authLimiter, loginController);
router.get('/me', requireAuth, meController);

export default router;
