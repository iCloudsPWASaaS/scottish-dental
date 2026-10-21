export const SITE_NAME = "Scottish Dental Marketplace";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Dedicated Postgres schema that holds all application tables.
 * Must also be listed under Supabase → Settings → API → Exposed schemas.
 */
export const SUPABASE_SCHEMA =
  process.env.NEXT_PUBLIC_SUPABASE_SCHEMA ?? "sdm";

export const TREATMENT_CATEGORIES = [
  "general",
  "emergency",
  "hygiene",
  "restorative",
  "cosmetic",
  "orthodontic",
  "implants",
  "oral_surgery",
  "sedation",
] as const;

export const NHS_BOARDS = [
  "NHS Ayrshire and Arran",
  "NHS Borders",
  "NHS Dumfries and Galloway",
  "NHS Fife",
  "NHS Forth Valley",
  "NHS Grampian",
  "NHS Greater Glasgow and Clyde",
  "NHS Highland",
  "NHS Lanarkshire",
  "NHS Lothian",
  "NHS Orkney",
  "NHS Shetland",
  "NHS Tayside",
  "NHS Western Isles",
] as const;

export const PLANS = [
  { id: "free", name: "Free", price_monthly: 0 },
  { id: "professional", name: "Professional", price_monthly: 39 },
  { id: "premium", name: "Premium", price_monthly: 79 },
] as const;

export const ENQUIRY_NOT_CONFIRMED_MESSAGE =
  "This is an appointment request, not a confirmed booking.";
