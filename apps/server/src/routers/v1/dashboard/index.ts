import { Router } from 'express';
import { getDashboardSummary } from '@/controllers/dashboard';
import { authMiddleware } from '@/middlewares/auth';
import { asyncHandler } from '@/utils/asyncHandler';

const dashboardRouter = Router();

dashboardRouter.get('/summary', authMiddleware, asyncHandler(getDashboardSummary));

export default dashboardRouter;
