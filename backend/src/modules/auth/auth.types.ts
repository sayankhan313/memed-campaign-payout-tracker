
export type UserRole = 'brand' | 'creator';

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
}

export interface AccessTokenPayload {
  userId: string;
  role: UserRole;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  instagramUsername?: string;
  youtubeChannelUrl?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
