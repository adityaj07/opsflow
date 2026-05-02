import { createTaskSchema } from "@opsflow/shared";
import { z } from "zod";

export const createTaskFormSchema = createTaskSchema
  .omit({ dueDate: true })
  .extend({
    dueDate: z.date().optional(),
    dueHour: z.number().int().min(1).max(12).optional(),
    dueMinute: z.number().int().min(0).max(59).optional(),
    duePeriod: z.enum(["AM", "PM"]).optional(),
  });
