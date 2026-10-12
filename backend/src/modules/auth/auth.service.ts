
import bcrypt from 'bcryptjs';
import type { HydratedDocument } from 'mongoose';
import { UserModel, type IUser } from './auth.model.js';
import { AuthError } from './auth.error.js';
import { generateAccessToken } from './auth.jwt.js';
import type { SignupInput, LoginInput } from './auth.validation.js';

const toPublicUser = (user: HydratedDocument<IUser>) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
});

export const signup = async (input: SignupInput) => {
  const existingUser = await UserModel.exists({ email: input.email });

  if (existingUser) {
    throw new AuthError('An account with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  let user: HydratedDocument<IUser>;

  try {
    user = await UserModel.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      throw new AuthError('An account with this email already exists', 409);
    }
    throw error;
  }

  return {
    message: 'Account created successfully',
    user: toPublicUser(user),
    accessToken: generateAccessToken(String(user._id), user.role),
  };
};

export const login = async (input: LoginInput) => {
  const user = await UserModel.findOne({ email: input.email }).select('+passwordHash');

  if (!user) {
    throw new AuthError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AuthError('Invalid email or password', 401);
  }

  return {
    message: 'Login successful',
    user: toPublicUser(user),
    accessToken: generateAccessToken(String(user._id), user.role),
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AuthError('User account not found', 404);
  }

  return toPublicUser(user);
};
