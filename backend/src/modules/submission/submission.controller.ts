
import type { Request, RequestHandler } from 'express';
import { AppError } from '../../errors/app.error.js';
import { createSubmission, getCreatorSubmissions } from './submission.service.js';

function getCreatorId(req: Request): string {
  if (!req.authUser) {
    throw new AppError('Authentication required', 401);
  }

  return req.authUser.id;
}

export const createSubmissionController: RequestHandler = async (req, res, next) => {
  try {
    const creatorId = getCreatorId(req);
    const submission = await createSubmission(creatorId, req.body);

    res.status(201).json({
      success: true,
      message: 'Post submitted successfully',
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

export const getCreatorSubmissionsController: RequestHandler = async (req, res, next) => {
  try {
    const creatorId = getCreatorId(req);
    const submissions = await getCreatorSubmissions(creatorId);

    res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
};
