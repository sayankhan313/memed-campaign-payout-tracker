
import type { RequestHandler } from 'express';
import { signupSchema, loginSchema } from './auth.validation.js';
import { signup, login, getCurrentUser } from './auth.service.js';
import { AuthError } from './auth.error.js';

export const signupController: RequestHandler = async (req, res, next) => {
  try {
    const result = signupSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: 'Invalid signup details',
        errors: result.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
      return;
    }

    const data = await signup(result.data);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const loginController: RequestHandler = async (req, res, next) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: 'Invalid login details',
        errors: result.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
      return;
    }

    const data = await login(result.data);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const meController: RequestHandler = async (req, res, next) => {
  try {
    if (!req.authUser) {
      throw new AuthError('Authentication required', 401);
    }

    const user = await getCurrentUser(req.authUser.id);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};
