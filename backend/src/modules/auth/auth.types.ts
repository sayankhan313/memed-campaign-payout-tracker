
export type UserRole = 'brand' | 'creator';

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
}

export interface AccessTokenPayload {
  userId: string;
  role: UserRole;
}
