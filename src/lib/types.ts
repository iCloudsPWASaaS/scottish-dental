export type Role =
  | "patient"
  | "practice_owner"
  | "practice_member"
  | "business_development"
  | "admin"
  | "super_admin";

export type PracticeStatus =
  | "draft"
  | "pending"
  | "in_review"
  | "published"
  | "suspended"
  | "deactivated";

export type ProspectStatus =
  | "identified"
  | "deduplicated"
  | "verified"
  | "awaiting_contact"
  | "outreach_sent"
  | "interested"
  | "follow_up"
  | "invitation_sent"
  | "registered"
  | "authority_verified"
  | "profile_completed"
  | "admin_review"
  | "published"
  | "no_response"
  | "declined"
  | "do_not_contact"
  | "suspended"
  | "verification_failed"
  | "archived";

export type EnquiryStatus =
  | "received"
  | "acknowledged"
  | "contacted"
  | "converted"
  | "closed"
  | "declined";

export type NhsPrivate = "nhs" | "private" | "mixed" | "unverified";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  phone: string | null;
  organisation_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Treatment {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string | null;
  limitations: string[];
  is_patient_facing: boolean;
}

export interface Clinician {
  id: string;
  practice_location_id: string;
  full_name: string;
  gdc_number: string | null;
  bio: string | null;
  specialties: string[];
  is_verified: boolean;
}

export interface Price {
  id: string;
  practice_location_id: string;
  treatment_id: string | null;
  label: string;
  amount: number | null;
  currency: string;
  price_type: string;
  conditions: string | null;
  nhs: boolean;
  confirmed_at: string | null;
}

export interface PracticeLocation {
  id: string;
  organisation_id: string | null;
  name: string;
  slug: string;
  address: string;
  postcode: string;
  local_authority: string | null;
  nhs_board: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  bio: string | null;
  image_url: string | null;
  nhs_private: NhsPrivate;
  accepting_new_nhs: boolean;
  opening_hours: Record<string, { opens: string; closes: string } | null>;
  facilities: string[];
  languages: string[];
  accessibility: string[];
  sedation_options: string[];
  appointment_mode: string;
  status: PracticeStatus;
  verified_at: string | null;
  published_at: string | null;
  last_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PracticeDetail extends PracticeLocation {
  treatments: Treatment[];
  clinicians: Clinician[];
  prices: Price[];
}

export interface Enquiry {
  id: string;
  practice_location_id: string;
  patient_name: string;
  patient_email: string | null;
  patient_phone: string | null;
  preferred_contact: string;
  treatment_id: string | null;
  message: string | null;
  status: EnquiryStatus;
  consent_given: boolean;
  created_at: string;
  updated_at: string;
}

export interface Prospect {
  id: string;
  practice_name: string;
  address: string | null;
  postcode: string | null;
  local_authority: string | null;
  nhs_board: string | null;
  website: string | null;
  general_email: string | null;
  general_phone: string | null;
  status: ProspectStatus;
  assigned_manager_id: string | null;
  attempts: number;
  notes: string | null;
  next_contact_date: string | null;
  do_not_contact: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
}
