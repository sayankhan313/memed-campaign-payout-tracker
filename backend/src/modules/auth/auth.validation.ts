
import { AppError } from '../../errors/app.error.js';
import type { UserRole } from './auth.types.js';

interface SignupInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface LoginInput {
  email: string;
  password: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateSignupInput(body: unknown): SignupInput {
  if (!isRecord(body)) {
    throw new AppError('Invalid signup details', 400);
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = body.password;
  const role = body.role;

  if (name.length < 2 || name.length > 80) {
    throw new AppError('Name must be between 2 and 80 characters', 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError('Invalid email address', 400);
  }

  if (
    typeof password !== 'string' ||
    password.length < 8 ||
    password.length > 128 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[^A-Za-z0-9\s]/.test(password)
  ) {
    throw new AppError(
      'Password must contain 8-128 characters, uppercase, lowercase, number and special character',
      400
    );
  }

  if (role !== 'brand' && role !== 'creator') {
    throw new AppError('Invalid user role', 400);
  }

  return { name, email, password, role };
}

export function validateLoginInput(body: unknown): LoginInput {
  if (!isRecord(body)) {
    throw new AppError('Invalid login details', 400);
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = body.password;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError('Invalid email address', 400);
  }

  if (typeof password !== 'string' || password.length === 0) {
    throw new AppError('Password is required', 400);
  }

  return { email, password };
}
