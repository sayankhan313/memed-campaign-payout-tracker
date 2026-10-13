
import { Schema, model } from 'mongoose';

export type UserRole = 'brand' | 'creator';

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  instagramUsername?: string;
  youtubeChannelUrl?: string;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, required: true, enum: ['brand', 'creator'] },
  instagramUsername: { type: String, trim: true, maxlength: 30 },
  youtubeChannelUrl: { type: String, trim: true, maxlength: 250 },
}, { timestamps: true });

export const UserModel = model<IUser>('User', userSchema);
