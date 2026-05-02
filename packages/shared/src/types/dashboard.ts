import type { z } from 'zod';
import {
  dashboardActivityItemSchema,
  dashboardActivityResponseSchema,
  dashboardOverviewResponseSchema,
} from '../schemas/dashboard.js';

export type DashboardOverviewResponse = z.infer<typeof dashboardOverviewResponseSchema>;
export type DashboardActivityItem = z.infer<typeof dashboardActivityItemSchema>;
export type DashboardActivityResponse = z.infer<typeof dashboardActivityResponseSchema>;
