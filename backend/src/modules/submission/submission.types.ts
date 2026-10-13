
import type { Types } from 'mongoose';

export interface CreateSubmissionInput {
  campaignId: string;
  postUrl: string;
}

export interface Submission {
  campaignId: Types.ObjectId;
  creatorId: Types.ObjectId;
  postUrl: string;
  views: number;
  paidAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubmissionResponse {
  id: string;
  campaignId: string;
  postUrl: string;
  views: number;
  paidAmount: number;
  createdAt: Date;
  updatedAt: Date;
}
