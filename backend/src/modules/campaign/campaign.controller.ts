
import type { Request, RequestHandler } from 'express';
import { AppError } from '../../errors/app.error.js';
import {
  createCampaign,
  getBrandCampaigns,
  getLiveCampaigns,
  getCampaignDetails,
  updateCampaignDetails,
  transitionCampaign,
  getBrandCampaignSubmissions,
  getBrandSpikeAnalytics,
} from './campaign.service.js';

function getAuthenticatedUser(req: Request) {
  if (!req.authUser) throw new AppError('Authentication required', 401);
  return req.authUser;
}

function getCampaignId(req: Request): string {
  if (typeof req.params.id !== 'string') throw new AppError('Invalid campaign ID', 400);
  return req.params.id;
}

export const createCampaignController: RequestHandler = async (req, res, next) => {
  try {
    const campaign = await createCampaign(getAuthenticatedUser(req).id, req.body);
    res.status(201).json({ success: true, message: 'Campaign created successfully', data: campaign });
  } catch (error) {
    next(error);
  }
};

export const getBrandCampaignsController: RequestHandler = async (req, res, next) => {
  try {
    const campaigns = await getBrandCampaigns(getAuthenticatedUser(req).id);
    res.status(200).json({ success: true, data: campaigns });
  } catch (error) {
    next(error);
  }
};

export const getLiveCampaignsController: RequestHandler = async (_req, res, next) => {
  try {
    const campaigns = await getLiveCampaigns();
    res.status(200).json({ success: true, data: campaigns });
  } catch (error) {
    next(error);
  }
};

export const getBrandSpikeAnalyticsController: RequestHandler = async (req, res, next) => {
  try {
    const analytics = await getBrandSpikeAnalytics(getAuthenticatedUser(req).id);
    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    next(error);
  }
};

export const getCampaignDetailsController: RequestHandler = async (req, res, next) => {
  try {
    const campaign = await getCampaignDetails(getCampaignId(req), getAuthenticatedUser(req));
    res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    next(error);
  }
};

export const updateCampaignController: RequestHandler = async (req, res, next) => {
  try {
    const campaign = await updateCampaignDetails(getCampaignId(req), getAuthenticatedUser(req).id, req.body);
    res.status(200).json({ success: true, message: 'Campaign updated successfully', data: campaign });
  } catch (error) {
    next(error);
  }
};

export const transitionCampaignController: RequestHandler = async (req, res, next) => {
  try {
    const campaign = await transitionCampaign(getCampaignId(req), getAuthenticatedUser(req).id, req.body);
    res.status(200).json({ success: true, message: 'Campaign status updated', data: campaign });
  } catch (error) {
    next(error);
  }
};

export const getBrandCampaignSubmissionsController: RequestHandler = async (req, res, next) => {
  try {
    const submissions = await getBrandCampaignSubmissions(getCampaignId(req), getAuthenticatedUser(req).id);
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    next(error);
  }
};
