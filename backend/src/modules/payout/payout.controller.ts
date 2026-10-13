
import type { RequestHandler } from 'express';
import { AppError } from '../../errors/app.error.js';
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
