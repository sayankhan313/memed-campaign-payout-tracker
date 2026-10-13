
import type { RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';
import { UserModel } from '../modules/auth/auth.model.js';
import type { AuthenticatedUser } from '../modules/auth/auth.types.js';
import { verifyAccessToken } from '../utils/jwt.util.js';
import { AppError } from '../errors/app.error.js';

declare module 'express-serve-static-core' {
  interface Request {
    authUser?: AuthenticatedUser;
  }
}

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authorization.slice(7).trim();
    const payload = verifyAccessToken(token);

    if (!isValidObjectId(payload.userId)) {
      throw new AppError('Invalid authentication token', 401);
    }

    const user = await UserModel.findById(payload.userId).select('role');

    if (!user || user.role !== payload.role) {
      throw new AppError('Invalid or unavailable account', 401);
    }

    req.authUser = {
      id: String(user._id),
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};
