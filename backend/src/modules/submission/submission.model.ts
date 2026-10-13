
import { Schema, model } from 'mongoose';
import type { Submission } from './submission.types.js';

const submissionSchema = new Schema<Submission>({
  campaignId: {
    type: Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
    index: true,
  },
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  postUrl: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2048,
  },
  views: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    validate: Number.isSafeInteger,
  },
  paidAmount: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    validate: Number.isSafeInteger,
  },
}, { timestamps: true });

submissionSchema.index({ campaignId: 1, postUrl: 1 }, { unique: true });
submissionSchema.index({ creatorId: 1, createdAt: -1 });

export const SubmissionModel = model<Submission>('Submission', submissionSchema);
