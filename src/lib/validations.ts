import { z } from 'zod';

// ── Booking ──
export const bookingSchema = z.object({
  storageType: z.enum(['buiten', 'binnen', 'seizoen']),
  caravanLength: z.string().min(1, 'Selecteer caravanlengte'),
  startDate: z.string().min(1, 'Selecteer startdatum'),
  locationId: z.number().positive(),
  // Extras
  extras: z.array(z.string()).default([]),
  // Customer info (step 2)
  firstName: z.string().min(2, 'Minimum 2 tekens'),
  lastName: z.string().min(2, 'Minimum 2 tekens'),
  email: z.string().email('Ongeldig e-mailadres'),
  phone: z.string().min(8, 'Ongeldig telefoonnummer'),
  // Caravan info
  brand: z.string().min(1, 'Verplicht'),
  model: z.string().optional(),
  licensePlate: z.string().optional(),
  year: z.number().optional(),
  weight: z.number().optional(),
  hasMover: z.boolean().default(false),
});

export const checkAvailabilitySchema = z.object({
  storageType: z.enum(['buiten', 'binnen', 'seizoen']),
  caravanLength: z.string().min(1),
  startDate: z.string().min(1),
  locationId: z.number().positive(),
});

// ── Contact ──
export const contactSchema = z.object({
  name: z.string().min(2, 'Minimum 2 tekens').max(100),
  email: z.string().email('Ongeldig e-mailadres').max(255),
  phone: z.string().max(20).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(10, 'Minimum 10 tekens').max(5000),
});

// ── Customer Auth ──
export const loginSchema = z.object({
  email: z.string().email('Ongeldig e-mailadres'),
  password: z.string().min(1, 'Wachtwoord verplicht'),
});

export const registerSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email().max(255),
  password: z.string().min(8, 'Minimaal 8 tekens'),
  phone: z.string().max(20).optional(),
});

// ── Admin entities ──
export const customerSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional(),
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  country: z.string().max(5).default('NL'),
  company_name: z.string().max(200).optional(),
  notes: z.string().max(5000).optional(),
});

export const caravanSchema = z.object({
  customer_id: z.number().positive(),
  brand: z.string().min(1).max(100),
  model: z.string().max(100).optional(),
  year: z.number().min(1950).max(2030).optional(),
  license_plate: z.string().max(20).optional(),
  length_m: z.number().min(2).max(15).optional(),
  weight_kg: z.number().min(500).max(5000).optional(),
  has_mover: z.boolean().default(false),
  location_id: z.number().positive().optional(),
  spot_id: z.number().positive().optional(),
  status: z.enum(['gestald', 'op_camping', 'in_transit', 'onderhoud', 'verkocht']).default('gestald'),
  insurance_expiry: z.string().optional(),
  apk_expiry: z.string().optional(),
  notes: z.string().max(5000).optional(),
});

export const contractSchema = z.object({
  customer_id: z.number().positive(),
  caravan_id: z.number().positive(),
  location_id: z.number().positive(),
  spot_id: z.number().positive().optional(),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  monthly_rate: z.number().positive(),
  deposit: z.number().min(0).default(0),
  auto_renew: z.boolean().default(true),
  status: z.enum(['actief', 'verlopen', 'opgezegd', 'concept']).default('actief'),
  notes: z.string().max(5000).optional(),
});

export const invoiceSchema = z.object({
  customer_id: z.number().positive(),
  contract_id: z.number().positive().optional(),
  description: z.string().max(500).optional(),
  subtotal: z.number().positive(),
  tax_rate: z.number().min(0).max(100).default(21),
  tax_amount: z.number().min(0),
  total: z.number().positive(),
  due_date: z.string().min(1),
  notes: z.string().max(5000).optional(),
});

export const taskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  priority: z.enum(['urgent', 'hoog', 'normaal', 'laag']).default('normaal'),
  assigned_to: z.number().positive().optional(),
  location_id: z.number().positive().optional(),
  due_date: z.string().optional(),
});

export const transportSchema = z.object({
  caravan_id: z.number().positive(),
  pickup_address: z.string().max(500).optional(),
  delivery_address: z.string().max(500).optional(),
  scheduled_date: z.string().min(1),
  assigned_staff: z.number().positive().optional(),
  notes: z.string().max(5000).optional(),
});

export const serviceRequestSchema = z.object({
  customer_id: z.number().positive(),
  caravan_id: z.number().positive().optional(),
  service_type: z.string().min(1).max(100),
  description: z.string().max(5000).optional(),
});

export const staffSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8),
  phone: z.string().max(20).optional(),
  role: z.enum(['beheerder', 'medewerker', 'chauffeur', 'technicus']).default('medewerker'),
  location_id: z.number().positive().optional(),
});

// ── Helpers ──
export function validateBody<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    return { success: false, error: errors };
  }
  return { success: true, data: result.data };
}
