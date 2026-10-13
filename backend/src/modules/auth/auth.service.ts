
import { UserModel } from './auth.model.js';
import type { UserRole } from './auth.types.js';
import { AppError } from '../../errors/app.error.js';
import { generateAccessToken } from '../../utils/jwt.util.js';
import { hashPassword, comparePassword } from '../../utils/password.util.js';

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

export const signup = async (input: SignupInput) => {
  const email = input.email.trim().toLowerCase();

  const existingUser = await UserModel.findOne({ email });

  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  const passwordHash = await hashPassword(input.password);

  let user;

  try {
    user = await UserModel.create({
      name: input.name.trim(),
      email,
      passwordHash,
      role: input.role,
    });
  } catch (error) {
    if (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 11000
    ) {
      throw new AppError('Email already registered', 409);
    }

    throw error;
  }

  const accessToken = generateAccessToken(
    String(user._id),
    user.role
  );

  return {
    message: 'Account created successfully',
    accessToken,
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const login = async (input: LoginInput) => {
  const email = input.email.trim().toLowerCase();

  const user = await UserModel.findOne({ email })
    .select('+passwordHash');

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const passwordMatches = await comparePassword(
    input.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new AppError('Invalid email or password', 401);
  }

  const accessToken = generateAccessToken(
    String(user._id),
    user.role
  );

  return {
    message: 'Login successful',
    accessToken,
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await UserModel.findById(userId)
    .select('name email role');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
};
