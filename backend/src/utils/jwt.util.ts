
import jwt from 'jsonwebtoken';
import type { UserRole, AccessTokenPayload } from '../modules/auth/auth.types.js';
import { AppError } from '../errors/app.error.js';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new AppError('JWT configuration is invalid', 500);
  }

  return secret;
};

export const generateAccessToken = (userId: string, role: UserRole): string => {
  return jwt.sign({ role }, getJwtSecret(), {
    subject: userId,
    expiresIn: '1d',
    algorithm: 'HS256',
  });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: ['HS256'],
    });

    if (
      typeof decoded === 'string' ||
      typeof decoded.sub !== 'string' ||
      (decoded.role !== 'brand' && decoded.role !== 'creator')
    ) {
      throw new AppError('Invalid authentication token', 401);
    }

    return {
      userId: decoded.sub,
      role: decoded.role,
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Invalid or expired authentication token', 401);
    }

    throw error;
  }
};
