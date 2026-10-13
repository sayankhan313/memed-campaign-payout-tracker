
import type { Request, RequestHandler } from 'express';
import { AppError } from '../../errors/app.error.js';
import {
  createCampaign,
  getBrandCampaigns,
  getLiveCampaigns,
  getCampaignDetails,
} from './campaign.service.js';

function getAuthenticatedUser(req: Request) {
  if (!req.authUser) {
    throw new AppError('Authentication required', 401);
  }

  return req.authUser;
}

export const createCampaignController: RequestHandler = async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req);
    const campaign = await createCampaign(user.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

export const getBrandCampaignsController: RequestHandler = async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req);
    const campaigns = await getBrandCampaigns(user.id);

    res.status(200).json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    next(error);
  }
};

export const getLiveCampaignsController: RequestHandler = async (_req, res, next) => {
  try {
    const campaigns = await getLiveCampaigns();

    res.status(200).json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    next(error);
  }
};

export const getCampaignDetailsController: RequestHandler = async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req);
    const campaignId = req.params.id;

    if (typeof campaignId !== 'string') {
      throw new AppError('Invalid campaign ID', 400);
    }

    const campaign = await getCampaignDetails(campaignId, user);

    res.status(200).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};
