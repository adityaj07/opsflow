import type { z } from 'zod';
import { dashboardSummaryResponseSchema } from '../schemas/dashboard';

export type DashboardSummaryResponse = z.infer<typeof dashboardSummaryResponseSchema>;
