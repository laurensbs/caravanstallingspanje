import { z } from 'zod';
import { CAMPING_NAMES } from './campings';

const knownCamping = z
  .string()
  .refine((v) => CAMPING_NAMES.includes(v.trim()), 'Kies een camping uit de lijst');

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
  customer_id: z.number().int().positive().optional(),
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
  // Admin-only: vink aan als de klant al cash/bankoverboeking heeft
  // betaald. Zet paid_at direct, slaat de payment-link + pro-forma flow over.
  already_paid: z.boolean().optional(),
});

export const waitlistSchema = z.object({
  device_type: z.enum(['Grote koelkast', 'Tafelmodel koelkast', 'Airco']),
  name: z.string().min(2, 'Hoe heten we je aanspreken?').max(200),
  email: z.string().email('Klopt dit e-mailadres?'),
  phone: z.string().min(5, 'Op welk telefoonnummer kunnen we je bereiken?').max(40).optional().or(z.literal('')),
  camping: z.string().max(200).optional().or(z.literal('')),
  spot_number: z.string().max(50).optional().or(z.literal('')),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export const fridgeOrderSchema = z.object({
  device_type: z.enum(['Grote koelkast', 'Tafelmodel koelkast', 'Airco']),
  name: z.string().min(2, 'Hoe heten we je aanspreken?').max(200),
  email: z.string().email('Klopt dit e-mailadres?'),
  phone: z.string().min(5, 'Op welk telefoonnummer kunnen we je bereiken?').max(40),
  address: z.string().min(2, 'Welk adres gebruiken we voor de factuur?').max(300),
  postal_code: z.string().min(2, 'Vul je postcode in').max(20),
  city: z.string().min(2, 'In welke plaats woon je?').max(150),
  country: z.string().min(2, 'Welk land?').max(80),
  vat_number: z.string().max(40).optional().or(z.literal('')),
  camping: knownCamping,
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

// ─── Public service requests (forwarded to reparatiepanel) ───
// Vriendelijke meldingen — geen "Too small: expected string to have >=2 chars"
// achtige rauwe Zod-output meer richting de klant.
// Adresgegevens horen bij elke betaalde dienst — anders missen ze in de
// pro forma in Holded en kloppen onze boekhouding-exports niet.
// vat_number is optioneel (particulieren hebben er geen).
const billingFields = {
  address: z.string().min(2, 'Welk adres gebruiken we voor de factuur?').max(300),
  postal_code: z.string().min(2, 'Vul je postcode in').max(20),
  city: z.string().min(2, 'In welke plaats woon je?').max(150),
  country: z.string().min(2, 'Welk land?').max(80),
  vat_number: z.string().max(40).optional().or(z.literal('')),
};

const contactBase = {
  name: z.string().min(2, 'Hoe heten we je aanspreken?').max(200),
  email: z.string().email('Klopt dit e-mailadres?'),
  phone: z.string().min(5, 'Op welk telefoonnummer kunnen we je bereiken?').max(40),
  ...billingFields,
  registration: z.string().max(40).optional().or(z.literal('')),
  brand: z.string().max(80).optional().or(z.literal('')),
  model: z.string().max(80).optional().or(z.literal('')),
  locationHint: z.string().max(300).optional().or(z.literal('')),
};

export const repairOrderSchema = z.object({
  ...contactBase,
  description: z.string().min(5).max(3000),
});

export const serviceOrderSchema = z.object({
  ...contactBase,
  serviceCategory: z.string().min(1).max(150),
  description: z.string().max(2000).optional().or(z.literal('')),
});

export const inspectionOrderSchema = z.object({
  ...contactBase,
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  description: z.string().max(2000).optional().or(z.literal('')),
});

// Transport = betaalde dienst met twee modes:
//   - 'wij_rijden': wij halen op vanaf de camping (€100, heen + terug)
//   - 'zelf':       klant haalt zelf op uit de stalling (€50, sleuteloverdracht)
// Beide modes hebben een ophaal-datum + tijd nodig. pickup_location wordt
// server-side gezet op basis van mode (camping of "Stalling").
export const transportOrderSchema = z.object({
  ...contactBase,
  mode: z.enum(['wij_rijden', 'zelf']),
  camping: knownCamping,
  outboundDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ophaal-datum is verplicht'),
  outboundTime: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal('')),
  returnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Terug-datum is verplicht'),
  returnTime: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal('')),
  description: z.string().max(2000).optional().or(z.literal('')),
}).refine((d) => new Date(d.returnDate) >= new Date(d.outboundDate), {
  message: 'Terug-datum moet op of na ophaal-datum liggen',
  path: ['returnDate'],
});

// Publieke ideeënbus — anoniem mag, e-mail mag, naam mag.
export const ideaSchema = z.object({
  name: z.string().max(200).optional().or(z.literal('')),
  email: z.string().email('Vul een geldig e-mailadres in').optional().or(z.literal('')),
  category: z.string().max(80).optional().or(z.literal('')),
  title: z.string().min(3, 'Een korte samenvatting graag').max(200),
  message: z.string().min(10, 'Vertel iets meer (10+ tekens)').max(5000),
});

// Publiek contact-formulier — landen in admin-inbox + mail naar info@.
export const contactMessageSchema = z.object({
  name: z.string().min(2, 'Vul je naam in').max(200),
  email: z.string().email('Vul een geldig e-mailadres in'),
  phone: z.string().max(40).optional().or(z.literal('')),
  subject: z.string().max(200).optional().or(z.literal('')),
  message: z.string().min(5, 'Schrijf een bericht').max(5000),
});

// Stalling stays local; not forwarded to reparatiepanel.
export const settingsUpdateSchema = z.object({
  stalling_price_binnen: z.number().nonnegative().max(100000).optional(),
  stalling_price_buiten: z.number().nonnegative().max(100000).optional(),
  fridge_price_grote: z.number().nonnegative().max(10000).optional(),
  fridge_price_tafel: z.number().nonnegative().max(10000).optional(),
  fridge_price_airco: z.number().nonnegative().max(10000).optional(),
  fridge_stock_grote: z.number().int().nonnegative().max(10000).optional(),
  fridge_stock_tafel: z.number().int().nonnegative().max(10000).optional(),
  fridge_stock_airco: z.number().int().nonnegative().max(10000).optional(),
  transport_price_wij_rijden: z.number().nonnegative().max(10000).optional(),
  transport_price_zelf: z.number().nonnegative().max(10000).optional(),
  stalling_address: z.string().max(500).optional(),
});

export const stallingOrderSchema = z.object({
  type: z.enum(['binnen', 'buiten']),
  name: z.string().min(2, 'Hoe heten we je aanspreken?').max(200),
  email: z.string().email('Klopt dit e-mailadres?'),
  phone: z.string().min(5, 'Op welk telefoonnummer kunnen we je bereiken?').max(40),
  address: z.string().min(2, 'Welk adres gebruiken we voor de factuur?').max(300),
  postal_code: z.string().min(2, 'Vul je postcode in').max(20),
  city: z.string().min(2, 'In welke plaats woon je?').max(150),
  country: z.string().min(2, 'Welk land?').max(80),
  vat_number: z.string().max(40).optional().or(z.literal('')),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum is verplicht'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  registration: z.string().max(40).optional().or(z.literal('')),
  brand: z.string().max(80).optional().or(z.literal('')),
  model: z.string().max(80).optional().or(z.literal('')),
  length: z.string().max(20).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
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
    // Toon alleen de eerste vriendelijke melding aan de klant — geen rauwe
    // path:msg-lijst die op de banner als 'name: Vul je naam in, email: ...'
    // verschijnt. De rhf-resolver toont al per-veld inline-errors; deze
    // server-respons fungeert als fallback voor klanten zonder JS of
    // edge-cases waar de client het te laat opvangt.
    const first = result.error.issues[0];
    const error = first?.message || 'Sommige velden zijn nog niet ingevuld of niet correct.';
    return { success: false, error };
  }
  return { success: true, data: result.data };
}
