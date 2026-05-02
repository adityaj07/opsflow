import { Router } from 'express';
import { getDashboardActivity, getDashboardOverview } from '../../../controllers/dashboard/index.js';
import { authMiddleware } from '../../../middlewares/auth.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';

const dashboardRouter = Router();

dashboardRouter.get('/overview', authMiddleware, asyncHandler(getDashboardOverview));
dashboardRouter.get('/activity', authMiddleware, asyncHandler(getDashboardActivity));

export default dashboardRouter;
