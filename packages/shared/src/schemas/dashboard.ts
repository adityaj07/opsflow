import { z } from 'zod';

export const dashboardSummaryResponseSchema = z.object({
  total: z.number().int().min(0),
  todo: z.number().int().min(0),
  inProgress: z.number().int().min(0),
  done: z.number().int().min(0),
  other: z.number().int().min(0),
});
