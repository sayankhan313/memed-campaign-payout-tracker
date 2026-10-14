
import type { ClientSession, Types } from 'mongoose';
import { VIEW_SPIKE_THRESHOLD, ViewSpikeModel } from './view-spike.model.js';

export type ViewUpdateMode = 'MILESTONE_DEMO' | 'SPIKE_DEMO' | 'SIMULATED_PLATFORM';
export type ViewSpikeSource = Exclude<ViewUpdateMode, 'MILESTONE_DEMO'>;

export interface ViewSpikeAssessment {
  previousViews: number;
  newViews: number;
  deltaViews: number;
  source: ViewSpikeSource;
  reason: string;
}

export interface ViewSpikeIdentifiers {
  submissionId: Types.ObjectId;
  campaignId: Types.ObjectId;
  creatorId: Types.ObjectId;
}

export function assessViewSpike(previousViews: number, newViews: number, mode: ViewUpdateMode): ViewSpikeAssessment | null {
  if (mode === 'MILESTONE_DEMO') return null;
  if (!Number.isSafeInteger(previousViews) || !Number.isSafeInteger(newViews)) return null;
  if (previousViews < 0 || newViews <= previousViews) return null;

  const deltaViews = newViews - previousViews;
  if (deltaViews < VIEW_SPIKE_THRESHOLD) return null;

  return {
    previousViews,
    newViews,
    deltaViews,
    source: mode,
    reason: `Unusually large increase of ${deltaViews.toLocaleString('en-US')} views in a single update`,
  };
}

export async function recordViewSpike(
  identifiers: ViewSpikeIdentifiers,
  assessment: ViewSpikeAssessment,
  session: ClientSession,
): Promise<void> {
  await ViewSpikeModel.create([{
    submissionId: identifiers.submissionId,
    campaignId: identifiers.campaignId,
    creatorId: identifiers.creatorId,
    previousViews: assessment.previousViews,
    newViews: assessment.newViews,
    deltaViews: assessment.deltaViews,
    source: assessment.source,
    reason: assessment.reason,
  }], { session });
}
