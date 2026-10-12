
import type { RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';
import { UserModel, type UserRole } from './auth.model.js';
import { verifyAccessToken } from './auth.jwt.js';
import { AuthError } from './auth.error.js';

declare module 'express-serve-static-core' {
  interface Request {
    authUser?: {
      id: string;
      role: UserRole;
    };
  }
}

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new AuthError('Authentication required', 401);
    }

    const token = authorization.slice(7).trim();
    const payload = verifyAccessToken(token);

    if (!isValidObjectId(payload.userId)) {
      throw new AuthError('Invalid authentication token', 401);
    }

    const user = await UserModel.findById(payload.userId).select('role');

    if (!user || user.role !== payload.role) {
      throw new AuthError('Invalid or unavailable account', 401);
    }

    req.authUser = { id: String(user._id), role: user.role };
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (...allowedRoles: UserRole[]): RequestHandler => {
  return (req, _res, next) => {
    if (!req.authUser) {
      next(new AuthError('Authentication required', 401));
      return;
    }

    if (!allowedRoles.includes(req.authUser.role)) {
      next(new AuthError('Access denied for this role', 403));
      return;
    }

    next();
  };
};
