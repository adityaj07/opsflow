import { Router } from 'express';
import { getDashboardActivity, getDashboardOverview, getDashboardSummary } from '@/controllers/dashboard';
import { authMiddleware } from '@/middlewares/auth';
import { asyncHandler } from '@/utils/asyncHandler';

const dashboardRouter = Router();

dashboardRouter.get('/summary', authMiddleware, asyncHandler(getDashboardSummary));
dashboardRouter.get('/overview', authMiddleware, asyncHandler(getDashboardOverview));
dashboardRouter.get('/activity', authMiddleware, asyncHandler(getDashboardActivity));

export default dashboardRouter;
