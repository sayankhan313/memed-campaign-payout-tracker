
import { Schema, model } from 'mongoose';
import type { PayoutLedgerEntry } from './payout.types.js';

const payoutSchema = new Schema<PayoutLedgerEntry>({
  campaignId: {
    type: Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
    index: true,
  },
  submissionId: {
    type: Schema.Types.ObjectId,
    ref: 'Submission',
    required: true,
  },
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  milestonePayout: {
    type: Number,
    required: true,
    min: 1,
    validate: Number.isSafeInteger,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
    validate: Number.isSafeInteger,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

payoutSchema.index(
  { submissionId: 1, milestonePayout: 1 },
  { unique: true }
);

payoutSchema.index({ creatorId: 1, createdAt: -1 });

export const PayoutModel = model<PayoutLedgerEntry>('Payout', payoutSchema);
