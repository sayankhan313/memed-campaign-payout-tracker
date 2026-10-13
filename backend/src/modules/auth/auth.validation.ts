
import { z } from 'zod';
import { AppError } from '../../errors/app.error.js';
import type { SignupInput, LoginInput } from './auth.types.js';

const emailSchema = z.preprocess(
  value => typeof value === 'string' ? value.trim().toLowerCase() : '',
  z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address')
);

const signupSchema = z.object({
  name: z.preprocess(
    value => typeof value === 'string' ? value.trim() : '',
    z.string().min(2, 'Name must be between 2 and 80 characters').max(80, 'Name must be between 2 and 80 characters')
  ),
  email: emailSchema,
  password: z.preprocess(
    value => typeof value === 'string' ? value : '',
    z.string().refine(
      value => value.length >= 8 && value.length <= 128 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value) && /[^A-Za-z0-9\s]/.test(value),
      'Password must contain 8-128 characters, uppercase, lowercase, number and special character'
    )
  ),
  role: z.enum(['brand', 'creator'], { error: 'Invalid user role' }),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.preprocess(
    value => typeof value === 'string' ? value : '',
    z.string().min(1, 'Password is required')
  ),
});

export function validateSignupInput(body: unknown): SignupInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Invalid signup details', 400);
  }

  const result = signupSchema.safeParse(body);

  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message ?? 'Invalid signup details', 400);
  }

  return result.data;
}

export function validateLoginInput(body: unknown): LoginInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Invalid login details', 400);
  }

  const result = loginSchema.safeParse(body);

  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message ?? 'Invalid login details', 400);
  }

  return result.data;
}
