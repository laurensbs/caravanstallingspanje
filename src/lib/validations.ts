import { z } from 'zod';

export const loginSchema = z.object({
  adminId: z.number().int().positive(),
  password: z.string().min(1).max(200),
});

export const fridgeSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional().or(z.literal('')),
  extra_email: z.string().email().optional().or(z.literal('')),
  device_type: z.string().max(100).default('Grote koelkast'),
  notes: z.string().max(2000).optional(),
});

export const fridgeBookingSchema = z.object({
  camping: z.string().max(200).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  spot_number: z.string().max(50).optional(),
  status: z.enum(['compleet', 'controleren']).default('compleet'),
  notes: z.string().max(2000).optional(),
});

export const holdedInvoiceSchema = z.object({
  description: z.string().min(1).max(500),
  units: z.number().positive().default(1),
  subtotal: z.number().nonnegative(),
  tax: z.number().min(0).max(100).default(21),
  date: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

export function validateBody<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    return { success: false, error: errors };
  }
  return { success: true, data: result.data };
}
