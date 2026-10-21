-- Seed data (development only). Run after 0001_init.sql + 0002_rls.sql.
-- Idempotent-ish: safe to run once.

insert into sdm.treatments (slug, title, category, description, limitations, is_patient_facing)
values
  ('general', 'General Dentistry', 'general',
   'Routine examinations, check-ups, fillings and preventive care to keep your teeth and gums healthy.',
   array['Suitability depends on an individual assessment.', 'Does not guarantee any specific outcome.'], true),
  ('emergency', 'Emergency Dentistry', 'emergency',
   'Urgent care for severe pain, swelling, trauma or uncontrolled bleeding.',
   array['Not a substitute for emergency services (NHS 111 / 999).', 'Availability varies by practice.'], true),
  ('hygiene', 'Hygiene & Cleaning', 'hygiene',
   'Professional scale and polish, stain removal and gum health maintenance.',
   array['Results vary between individuals.'], true),
  ('restorative', 'Restorative Dentistry', 'restorative',
   'Fillings, crowns, bridges and dentures to restore function and appearance.',
   array['Treatment plan depends on clinical assessment.'], true),
  ('cosmetic', 'Cosmetic Dentistry', 'cosmetic',
   'Whitening, veneers and smile makeovers.',
   array['Not suitable for everyone.', 'No guaranteed aesthetic outcome.'], true),
  ('orthodontic', 'Orthodontics', 'orthodontic',
   'Braces and clear aligners to straighten teeth and correct bite.',
   array['Requires a full assessment.', 'Results depend on compliance and biology.'], true),
  ('implants', 'Dental Implants', 'implants',
   'Fixed replacement for missing teeth using titanium posts.',
   array['Not suitable for all patients.', 'Requires adequate bone and health assessment.'], true),
  ('oral_surgery', 'Oral Surgery', 'oral_surgery',
   'Extractions, including wisdom teeth, and minor surgical procedures.',
   array['Risks explained at consultation.'], true),
  ('sedation', 'Sedation Dentistry', 'sedation',
   'Options to help anxious patients relax during treatment.',
   array['Eligibility assessed case by case.'], true)
on conflict (slug) do nothing;
