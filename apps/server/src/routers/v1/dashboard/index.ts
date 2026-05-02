import { Router } from 'express';
import { getDashboardActivity, getDashboardOverview } from '@/controllers/dashboard';
import { authMiddleware } from '@/middlewares/auth';
import { asyncHandler } from '@/utils/asyncHandler';

const dashboardRouter = Router();

dashboardRouter.get('/overview', authMiddleware, asyncHandler(getDashboardOverview));
dashboardRouter.get('/activity', authMiddleware, asyncHandler(getDashboardActivity));

export default dashboardRouter;
