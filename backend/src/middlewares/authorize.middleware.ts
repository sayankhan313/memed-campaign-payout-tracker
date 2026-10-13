
import type { RequestHandler } from 'express';
import type { UserRole } from '../modules/auth/auth.types.js';
import { AppError } from '../errors/app.error.js';

export const requireRole = (...allowedRoles: UserRole[]): RequestHandler => {
  return (req, _res, next) => {
    if (!req.authUser) {
      next(new AppError('Authentication required', 401));
      return;
    }

    if (!allowedRoles.includes(req.authUser.role)) {
      next(new AppError('Access denied for this role', 403));
      return;
    }

    next();
  };
};
