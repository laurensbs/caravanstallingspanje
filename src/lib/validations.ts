import { z } from 'zod';

export const loginSchema = z.object({
  adminId: z.number().int().positive(),
  password: z.string().min(1).max(200),
});

export const setPasswordSchema = z.object({
  adminId: z.number().int().positive(),
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(10, 'Minimaal 10 tekens').max(200),
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

export const fridgeOrderSchema = z.object({
  device_type: z.enum(['Grote koelkast', 'Tafelmodel koelkast']),
  name: z.string().min(2).max(200),
  email: z.string().email(),
  phone: z.string().min(5).max(40),
  camping: z.string().min(2).max(200),
  spot_number: z.string().max(50).optional().or(z.literal('')),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum is verplicht'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum is verplicht'),
  notes: z.string().max(2000).optional().or(z.literal('')),
}).refine(d => new Date(d.end_date) > new Date(d.start_date), {
  message: 'Einddatum moet na startdatum liggen',
  path: ['end_date'],
}).refine(d => {
  const ms = new Date(d.end_date).getTime() - new Date(d.start_date).getTime();
  return ms / (1000 * 60 * 60 * 24) >= 7;
}, {
  message: 'Minimaal 7 dagen huren',
  path: ['end_date'],
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
