
import { Schema, model, type InferSchemaType } from 'mongoose';

export const VIEW_SPIKE_THRESHOLD = 100000;

const viewSpikeSchema = new Schema({
  submissionId: {
    type: Schema.Types.ObjectId,
    ref: 'Submission',
    required: true,
    index: true,
  },
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
  },
  previousViews: {
    type: Number,
    required: true,
    min: 0,
  },
  newViews: {
    type: Number,
    required: true,
    min: 0,
  },
  deltaViews: {
    type: Number,
    required: true,
    min: 0,
  },
  source: {
    type: String,
    enum: ['SPIKE_DEMO', 'SIMULATED_PLATFORM'],
    required: true,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

viewSpikeSchema.index({ submissionId: 1, createdAt: -1 });
viewSpikeSchema.index({ campaignId: 1, createdAt: -1 });

export type ViewSpike = InferSchemaType<typeof viewSpikeSchema>;

export const ViewSpikeModel = model('ViewSpike', viewSpikeSchema);
