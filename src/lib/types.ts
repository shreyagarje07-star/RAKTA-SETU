import { z } from 'zod';

// ---------- Blood Group ----------
export const BloodGroupEnum = z.enum([
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
]);
export type BloodGroup = z.infer<typeof BloodGroupEnum>;

// ---------- Donor ----------
export const DonorSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  blood_group: BloodGroupEnum,
  city: z.string().min(2),
  state: z.string().min(2),
  consent_sms: z.boolean(),
  is_available: z.boolean().default(true),
  last_donation_date: z.string().nullable().optional(), // ISO date or null
  total_donations: z.number().int().min(0).default(0),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Donor = z.infer<typeof DonorSchema>;

export const DonorRegistrationSchema = DonorSchema.omit({
  id: true,
  user_id: true,
  total_donations: true,
  created_at: true,
  updated_at: true,
  is_available: true,
}).extend({
  is_available: z.boolean().default(true),
});

export type DonorRegistration = z.infer<typeof DonorRegistrationSchema>;

// ---------- Blood Request ----------
export const BloodRequestSchema = z.object({
  id: z.string().uuid().optional(),
  hospital_name: z.string().min(2),
  blood_group: BloodGroupEnum,
  urgency: z.enum(['critical', 'urgent', 'normal']).default('urgent'),
  hospital_city: z.string().min(2),
  status: z.enum(['open', 'fulfilled', 'cancelled']).default('open'),
  created_by: z.string().uuid().optional(),
  notes: z.string().optional(),
  created_at: z.string().optional(),
});

export type BloodRequest = z.infer<typeof BloodRequestSchema>;

export const CreateBloodRequestSchema = BloodRequestSchema.omit({
  id: true,
  status: true,
  created_by: true,
  created_at: true,
});

export type CreateBloodRequest = z.infer<typeof CreateBloodRequestSchema>;

// ---------- Scored Donor (Matching result) ----------
export type ScoredDonor = Donor & {
  priority_score: number;
};

// ---------- Request Response ----------
export type RequestResponse = {
  id: string;
  request_id: string;
  donor_id: string;
  status: 'accepted' | 'declined';
  created_at: string;
};
