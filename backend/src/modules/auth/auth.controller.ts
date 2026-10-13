
import type { RequestHandler } from 'express';
import { AppError } from '../../errors/app.error.js';
import { signup, login, getCurrentUser } from './auth.service.js';
import { validateSignupInput, validateLoginInput } from './auth.validation.js';

export const signupController: RequestHandler = async (req, res, next) => {
  try {
    const input = validateSignupInput(req.body);
    const result = await signup(input);

    res.status(201).json({
      success: true,
      message: result.message,
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginController: RequestHandler = async (req, res, next) => {
  try {
    const input = validateLoginInput(req.body);
    const result = await login(input);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const meController: RequestHandler = async (req, res, next) => {
  try {
    if (!req.authUser) {
      throw new AppError('Authentication required', 401);
    }

    const user = await getCurrentUser(req.authUser.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
