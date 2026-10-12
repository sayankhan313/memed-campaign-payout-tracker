
import { z } from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])[^\r\n]{8,128}$/;

export const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must contain at least 2 characters').max(80),
  email: z.string().trim().email('Please enter a valid email').toLowerCase(),
  password: z.string()
    .min(8, 'Password must contain at least 8 characters')
    .max(128, 'Password cannot exceed 128 characters')
    .regex(passwordRegex, 'Include uppercase, lowercase, number and special character'),
  role: z.enum(['brand', 'creator']),
}).strict();

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
}).strict();

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
