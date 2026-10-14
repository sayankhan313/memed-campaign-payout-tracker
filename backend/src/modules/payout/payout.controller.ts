
import { isValidObjectId } from 'mongoose';
import type { RequestHandler } from 'express';
import { AppError } from '../../errors/app.error.js';
import { SubmissionModel } from '../submission/submission.model.js';
import { updateSubmissionViews, getCreatorEarnings } from './payout.service.js';

export const updateViewsController: RequestHandler = async (req, res, next) => {
  try {
    const submissionId = req.params.id;

    if (typeof submissionId !== 'string') {
      throw new AppError('Invalid submission ID', 400);
    }

    const result = await updateSubmissionViews(submissionId, req.body);

    res.status(200).json({
      success: true,
      message: 'Views and payout updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const simulateDemoViewsController: RequestHandler = async (req, res, next) => {
  try {
    if (process.env.ENABLE_DEMO_VIEW_SIMULATOR !== 'true') {
      throw new AppError('Demo simulator is disabled', 404);
    }

    if (!req.authUser) {
      throw new AppError('Authentication required', 401);
    }

    const submissionId = req.params.id;

    if (typeof submissionId !== 'string' || !isValidObjectId(submissionId)) {
      throw new AppError('Invalid submission ID', 400);
    }

    const { views, mode } = (req.body ?? {}) as { views?: unknown; mode?: unknown };

    if (mode !== 'MILESTONE_DEMO' && mode !== 'SPIKE_DEMO') {
      throw new AppError('Invalid demo mode', 400);
    }

    const ownsSubmission = await SubmissionModel.exists({
      _id: submissionId,
      creatorId: req.authUser.id,
    });

    if (!ownsSubmission) {
      throw new AppError('Submission not found', 404);
    }

    const result = await updateSubmissionViews(submissionId, { views }, mode);

    res.status(200).json({
      success: true,
      message: mode === 'SPIKE_DEMO'
        ? 'Spike simulation processed successfully'
        : 'Milestone simulation processed successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getCreatorEarningsController: RequestHandler = async (req, res, next) => {
  try {
    if (!req.authUser) {
      throw new AppError('Authentication required', 401);
    }

    const result = await getCreatorEarnings(req.authUser.id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
