import { z } from 'zod';

// ── Booking ──
export const bookingSchema = z.object({
  storageType: z.enum(['buiten', 'binnen']),
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
  storageType: z.enum(['buiten', 'binnen']),
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

// ── Guide Hub ──
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Shared i18n fields for guide schemas
const guideI18nFields = {
  name_en: z.string().max(200).optional(),
  name_es: z.string().max(200).optional(),
  description_en: z.string().max(10000).optional(),
  description_es: z.string().max(10000).optional(),
};
const blogI18nFields = {
  title_en: z.string().max(300).optional(),
  title_es: z.string().max(300).optional(),
  excerpt_en: z.string().max(1000).optional(),
  excerpt_es: z.string().max(1000).optional(),
  content_en: z.string().max(100000).optional(),
  content_es: z.string().max(100000).optional(),
};

export const guideCampingSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(slugRegex, 'Alleen kleine letters, cijfers en streepjes'),
  description: z.string().max(10000).optional(),
  ...guideI18nFields,
  region: z.string().max(100).default('Costa Brava'),
  town: z.string().max(100).optional(),
  address: z.string().max(300).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  stars: z.number().min(1).max(5).default(3),
  website: z.string().max(500).optional(),
  phone: z.string().max(30).optional(),
  price_range: z.string().max(10).default('€€'),
  amenities: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export const guidePlaceSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(slugRegex, 'Alleen kleine letters, cijfers en streepjes'),
  description: z.string().max(10000).optional(),
  ...guideI18nFields,
  region: z.string().max(100).default('Costa Brava'),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  highlights: z.array(z.string()).default([]),
  best_season: z.string().max(100).optional(),
  population: z.string().max(50).optional(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export const guideBeachSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(slugRegex, 'Alleen kleine letters, cijfers en streepjes'),
  description: z.string().max(10000).optional(),
  ...guideI18nFields,
  place_id: z.number().positive().optional(),
  region: z.string().max(100).default('Costa Brava'),
  beach_type: z.enum(['zand', 'kiezel', 'cala', 'rots']).default('zand'),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  facilities: z.array(z.string()).default([]),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export const guideAttractionSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(slugRegex, 'Alleen kleine letters, cijfers en streepjes'),
  description: z.string().max(10000).optional(),
  ...guideI18nFields,
  place_id: z.number().positive().optional(),
  region: z.string().max(100).default('Costa Brava'),
  category: z.enum(['museum', 'natuur', 'historisch', 'activiteit', 'park']).default('activiteit'),
  address: z.string().max(300).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  website: z.string().max(500).optional(),
  price_info: z.string().max(200).optional(),
  opening_hours: z.string().max(500).optional(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export const guideRestaurantSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(slugRegex, 'Alleen kleine letters, cijfers en streepjes'),
  description: z.string().max(10000).optional(),
  ...guideI18nFields,
  place_id: z.number().positive().optional(),
  region: z.string().max(100).default('Costa Brava'),
  cuisine_type: z.string().max(100).optional(),
  price_range: z.string().max(10).default('€€'),
  address: z.string().max(300).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  website: z.string().max(500).optional(),
  phone: z.string().max(30).optional(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export const guideBlogPostSchema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(300).regex(slugRegex, 'Alleen kleine letters, cijfers en streepjes'),
  excerpt: z.string().max(1000).optional(),
  content: z.string().max(100000).optional(),
  ...blogI18nFields,
  category: z.string().max(100).default('Algemeen'),
  read_time: z.string().max(20).default('5 min'),
  author: z.string().max(100).default('Caravanstalling Spanje'),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(false),
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
