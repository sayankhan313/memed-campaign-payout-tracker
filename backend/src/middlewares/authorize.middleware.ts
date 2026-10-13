
import type { RequestHandler } from 'express';
import type { UserRole } from '../modules/auth/auth.model.js';
import { AuthError } from '../modules/auth/auth.error.js';

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
