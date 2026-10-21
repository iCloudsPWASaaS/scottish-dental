import { z } from "zod";
import { COMMON_PASSWORDS, PASSWORD_MIN_LENGTH } from "@/lib/password";

export const searchPracticesSchema = z.object({
  q: z.string().trim().optional(),
  postcode: z.string().trim().optional(),
  treatment: z.string().trim().optional(),
  nhs: z.enum(["nhs", "private", "mixed"]).optional(),
  acceptingNewNhs: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .optional()
    .transform((v) => (typeof v === "string" ? v === "true" : v)),
  radiusKm: z.coerce.number().min(1).max(200).optional().default(10),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(12),
});

export type SearchPracticesQuery = z.infer<typeof searchPracticesSchema>;

export const createEnquirySchema = z.object({
  practice_location_id: z.string().uuid(),
  patient_name: z.string().trim().min(2).max(120),
  patient_email: z.string().email().max(200),
  patient_phone: z.string().trim().min(5).max(40).optional(),
  preferred_contact: z.enum(["email", "phone"]).default("email"),
  treatment_id: z.string().uuid().optional(),
  message: z.string().trim().max(2000).optional(),
  consent_given: z.boolean().refine((v) => v === true, {
    message: "Consent is required",
  }),
  website: z.string().max(0).optional(),
});

export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;

export const updateEnquiryStatusSchema = z.object({
  status: z.enum([
    "acknowledged",
    "contacted",
    "converted",
    "closed",
    "declined",
  ]),
  note: z.string().trim().max(2000).optional(),
});

export const updateLocationSchema = z.object({
  name: z.string().trim().min(2).max(160).optional(),
  phone: z.string().trim().max(40).optional(),
  email: z.string().email().max(200).optional(),
  website: z.string().url().max(300).optional().or(z.literal("")),
  address: z.string().trim().min(3).max(300).optional(),
  postcode: z.string().trim().min(3).max(12).optional(),
  local_authority: z.string().trim().max(120).optional(),
  nhs_private: z.enum(["nhs", "private", "mixed"]).optional(),
  accepting_new_nhs: z.boolean().optional(),
  opening_hours: z.record(z.any()).optional(),
  facilities: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  accessibility: z.array(z.string()).optional(),
  sedation_options: z.array(z.string()).optional(),
  appointment_mode: z
    .enum(["enquiry_only", "manual_availability", "integrated"])
    .optional(),
  bio: z.string().trim().max(4000).optional().or(z.literal("")),
  image_url: z.string().url().max(500).optional().or(z.literal("")),
});

export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;

export const updateEnquiryStatusBody = updateEnquiryStatusSchema;

export const createProspectSchema = z.object({
  practice_name: z.string().trim().min(2).max(200),
  address: z.string().trim().max(300).optional(),
  postcode: z.string().trim().max(12).optional(),
  local_authority: z.string().trim().max(120).optional(),
  nhs_board: z.string().trim().max(120).optional(),
  website: z.string().url().max(300).optional().or(z.literal("")),
  general_email: z.string().email().max(200).optional().or(z.literal("")),
  general_phone: z.string().trim().max(40).optional(),
  named_contact: z.string().trim().max(120).optional(),
  source_url: z.string().url().max(400).optional(),
  source_type: z.string().trim().max(60).optional(),
  region: z.string().trim().max(120).optional(),
  services: z.array(z.string().trim().max(80)).max(40).optional(),
  notes: z.string().trim().max(4000).optional(),
});

export type CreateProspectInput = z.infer<typeof createProspectSchema>;

export const updateProspectSchema = createProspectSchema.partial().extend({
  status: z
    .enum([
      "identified",
      "deduplicated",
      "verified",
      "awaiting_contact",
      "outreach_sent",
      "interested",
      "follow_up",
      "invitation_sent",
      "registered",
      "authority_verified",
      "profile_completed",
      "admin_review",
      "published",
      "no_response",
      "declined",
      "do_not_contact",
      "suspended",
      "verification_failed",
      "archived",
    ])
    .optional(),
  assigned_manager_id: z.string().uuid().optional().nullable(),
  next_contact_date: z.string().datetime().optional().nullable(),
  marketing_basis: z.string().trim().max(200).optional(),
  opt_out: z.boolean().optional(),
  do_not_contact: z.boolean().optional(),
  archived: z.boolean().optional(),
});

export type UpdateProspectInput = z.infer<typeof updateProspectSchema>;

export const outreachSchema = z.object({
  activity_type: z.enum(["email", "phone", "in_person", "other"]),
  status: z.enum(["sent", "responded", "scheduled", "completed", "bounced"]),
  notes: z.string().trim().max(4000).optional(),
});

export type OutreachInput = z.infer<typeof outreachSchema>;

export const invitationSchema = z.object({
  email: z.string().email().max(200),
  expires_in_days: z.coerce.number().int().min(1).max(90).default(14),
});

export type InvitationInput = z.infer<typeof invitationSchema>;

export const reviewDecisionSchema = z.object({
  decision: z.enum(["approve", "reject", "request_changes"]),
  reason: z.string().trim().max(2000).optional(),
});

export type ReviewDecisionInput = z.infer<typeof reviewDecisionSchema>;

const passwordField = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`)
  .max(200)
  .refine((v) => !COMMON_PASSWORDS.has(v.toLowerCase()), {
    message: "Please choose a less common password.",
  });

export const signupSchema = z
  .object({
    email: z.string().email().max(200),
    password: passwordField,
    confirm_password: passwordField.optional(),
    full_name: z.string().trim().min(2).max(120),
    role: z.enum(["patient", "practice_owner", "practice_member"]),
  })
  .refine((data) => !data.confirm_password || data.password === data.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const signinSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});

export type SigninInput = z.infer<typeof signinSchema>;

export const setRoleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum([
    "patient",
    "practice_owner",
    "practice_member",
    "business_development",
    "admin",
    "super_admin",
  ]),
});

export type SetRoleInput = z.infer<typeof setRoleSchema>;
