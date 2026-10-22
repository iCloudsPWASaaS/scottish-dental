insert into sdm.organisations (id, name, owner_id) values ('d1554ca7-956a-471d-9975-c0a8dd281773', 'Green Oakham Dental Care', '16a0e57f-1630-4860-8c34-3c9907b9b9b6') on conflict (id) do nothing;
update sdm.profiles set organisation_id = 'd1554ca7-956a-471d-9975-c0a8dd281773' where id = '16a0e57f-1630-4860-8c34-3c9907b9b9b6';
insert into sdm.organisation_members (organisation_id, profile_id, membership_role) values ('d1554ca7-956a-471d-9975-c0a8dd281773', '16a0e57f-1630-4860-8c34-3c9907b9b9b6', 'owner') on conflict (organisation_id, profile_id) do nothing;
insert into sdm.practice_locations (id, organisation_id, name, slug, address, postcode, town, nhs_private, accepting_new_nhs, phone, status, published_at, verified_at, bio, image_url, rating, rating_count, opening_hours, appointment_mode)
       values ('a5004213-a9ff-401c-ad78-0242715e6959', 'd1554ca7-956a-471d-9975-c0a8dd281773', 'Green Oakham Dental Care', 'green-oakham-dental-care', '4 Market Place, Oakham', 'LE15 6DT', 'Oakham', 'mixed', false, '01572 756123', 'published', now(), now(), 'Green Oakham Dental Care is a trusted dental practice in Oakham, offering high-quality NHS and private dental care.', '/images/practices/green-oakham-dental-care.jpg', 5, 87, '{}'::jsonb, 'enquiry_only')
       on conflict (id) do nothing;
insert into sdm.clinic_credentials (organisation_id, auth_user_id, login_email, login_password)
       values ('d1554ca7-956a-471d-9975-c0a8dd281773', '16a0e57f-1630-4860-8c34-3c9907b9b9b6', 'portal-green-oakham-dental-care@clinic.test', 'Moon007!786!')
       on conflict (organisation_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'a5004213-a9ff-401c-ad78-0242715e6959', t.id, true from sdm.treatments t where t.slug = 'general'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'a5004213-a9ff-401c-ad78-0242715e6959', t.id, true from sdm.treatments t where t.slug = 'hygiene'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'a5004213-a9ff-401c-ad78-0242715e6959', t.id, true from sdm.treatments t where t.slug = 'cosmetic'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'a5004213-a9ff-401c-ad78-0242715e6959', t.id, true from sdm.treatments t where t.slug = 'emergency'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.organisations (id, name, owner_id) values ('cfa0975f-7361-438a-971c-76d27be79e79', 'Blue Light Dental & Aesthetic Clinic', 'b8886059-6e32-4049-8d1d-953a6119aafd') on conflict (id) do nothing;
update sdm.profiles set organisation_id = 'cfa0975f-7361-438a-971c-76d27be79e79' where id = 'b8886059-6e32-4049-8d1d-953a6119aafd';
insert into sdm.organisation_members (organisation_id, profile_id, membership_role) values ('cfa0975f-7361-438a-971c-76d27be79e79', 'b8886059-6e32-4049-8d1d-953a6119aafd', 'owner') on conflict (organisation_id, profile_id) do nothing;
insert into sdm.practice_locations (id, organisation_id, name, slug, address, postcode, town, nhs_private, accepting_new_nhs, phone, status, published_at, verified_at, bio, image_url, rating, rating_count, opening_hours, appointment_mode)
       values ('a3a66fcc-8781-4195-abdb-efb30f086761', 'cfa0975f-7361-438a-971c-76d27be79e79', 'Blue Light Dental & Aesthetic Clinic', 'blue-light-dental-aesthetic-clinic', '184 City Road, London', 'EC1V 2PD', 'London', 'private', false, '020 7253 8899', 'published', now(), now(), 'Blue Light Dental & Aesthetic Clinic is a trusted dental practice in London, offering high-quality NHS and private dental care.', '/images/practices/blue-light-dental-aesthetic-clinic.jpg', 4.8, 156, '{}'::jsonb, 'enquiry_only')
       on conflict (id) do nothing;
insert into sdm.clinic_credentials (organisation_id, auth_user_id, login_email, login_password)
       values ('cfa0975f-7361-438a-971c-76d27be79e79', 'b8886059-6e32-4049-8d1d-953a6119aafd', 'portal-blue-light-dental-aesthetic-clinic@clinic.test', 'Moon007!786!')
       on conflict (organisation_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'a3a66fcc-8781-4195-abdb-efb30f086761', t.id, true from sdm.treatments t where t.slug = 'general'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'a3a66fcc-8781-4195-abdb-efb30f086761', t.id, true from sdm.treatments t where t.slug = 'hygiene'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'a3a66fcc-8781-4195-abdb-efb30f086761', t.id, true from sdm.treatments t where t.slug = 'cosmetic'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'a3a66fcc-8781-4195-abdb-efb30f086761', t.id, true from sdm.treatments t where t.slug = 'orthodontic'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'a3a66fcc-8781-4195-abdb-efb30f086761', t.id, true from sdm.treatments t where t.slug = 'sedation'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.organisations (id, name, owner_id) values ('b5518628-b975-49d0-bde3-d58d818d3e71', 'Village Dental Practice', '6b802fc0-5b1a-45d3-90d1-37b3091e7fee') on conflict (id) do nothing;
update sdm.profiles set organisation_id = 'b5518628-b975-49d0-bde3-d58d818d3e71' where id = '6b802fc0-5b1a-45d3-90d1-37b3091e7fee';
insert into sdm.organisation_members (organisation_id, profile_id, membership_role) values ('b5518628-b975-49d0-bde3-d58d818d3e71', '6b802fc0-5b1a-45d3-90d1-37b3091e7fee', 'owner') on conflict (organisation_id, profile_id) do nothing;
insert into sdm.practice_locations (id, organisation_id, name, slug, address, postcode, town, nhs_private, accepting_new_nhs, phone, status, published_at, verified_at, bio, image_url, rating, rating_count, opening_hours, appointment_mode)
       values ('89d94e98-cd37-43c4-9163-314415903adf', 'b5518628-b975-49d0-bde3-d58d818d3e71', 'Village Dental Practice', 'village-dental-practice-slough', '27 High Street, Slough', 'SL1 1JG', 'Slough', 'mixed', false, '01753 524110', 'published', now(), now(), 'Village Dental Practice is a trusted dental practice in Slough, offering high-quality NHS and private dental care.', '/images/practices/village-dental-practice-slough.jpg', 5, 64, '{}'::jsonb, 'enquiry_only')
       on conflict (id) do nothing;
insert into sdm.clinic_credentials (organisation_id, auth_user_id, login_email, login_password)
       values ('b5518628-b975-49d0-bde3-d58d818d3e71', '6b802fc0-5b1a-45d3-90d1-37b3091e7fee', 'portal-village-dental-practice-slough@clinic.test', 'Moon007!786!')
       on conflict (organisation_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '89d94e98-cd37-43c4-9163-314415903adf', t.id, true from sdm.treatments t where t.slug = 'general'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '89d94e98-cd37-43c4-9163-314415903adf', t.id, true from sdm.treatments t where t.slug = 'restorative'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '89d94e98-cd37-43c4-9163-314415903adf', t.id, true from sdm.treatments t where t.slug = 'implants'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '89d94e98-cd37-43c4-9163-314415903adf', t.id, true from sdm.treatments t where t.slug = 'emergency'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.organisations (id, name, owner_id) values ('37d6f54d-5b86-46a5-bffb-898f63c60c3b', 'St Peter''s Lodge Dental Practice', '6e656ab9-2f56-420d-8497-ef1eb3c5d29c') on conflict (id) do nothing;
update sdm.profiles set organisation_id = '37d6f54d-5b86-46a5-bffb-898f63c60c3b' where id = '6e656ab9-2f56-420d-8497-ef1eb3c5d29c';
insert into sdm.organisation_members (organisation_id, profile_id, membership_role) values ('37d6f54d-5b86-46a5-bffb-898f63c60c3b', '6e656ab9-2f56-420d-8497-ef1eb3c5d29c', 'owner') on conflict (organisation_id, profile_id) do nothing;
insert into sdm.practice_locations (id, organisation_id, name, slug, address, postcode, town, nhs_private, accepting_new_nhs, phone, status, published_at, verified_at, bio, image_url, rating, rating_count, opening_hours, appointment_mode)
       values ('e3462df5-c705-4946-ab83-a1b54f14a78d', '37d6f54d-5b86-46a5-bffb-898f63c60c3b', 'St Peter''s Lodge Dental Practice', 'st-peters-lodge-dental-practice', 'St Peter''s Lodge, London Road, St Albans', 'AL1 1HQ', 'St Albans', 'private', false, '01727 855612', 'published', now(), now(), 'St Peter''s Lodge Dental Practice is a trusted dental practice in St Albans, offering high-quality NHS and private dental care.', '/images/practices/st-peters-lodge-dental-practice.jpg', 4.8, 112, '{}'::jsonb, 'enquiry_only')
       on conflict (id) do nothing;
insert into sdm.clinic_credentials (organisation_id, auth_user_id, login_email, login_password)
       values ('37d6f54d-5b86-46a5-bffb-898f63c60c3b', '6e656ab9-2f56-420d-8497-ef1eb3c5d29c', 'portal-st-peters-lodge-dental-practice@clinic.test', 'Moon007!786!')
       on conflict (organisation_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'e3462df5-c705-4946-ab83-a1b54f14a78d', t.id, true from sdm.treatments t where t.slug = 'general'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'e3462df5-c705-4946-ab83-a1b54f14a78d', t.id, true from sdm.treatments t where t.slug = 'hygiene'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'e3462df5-c705-4946-ab83-a1b54f14a78d', t.id, true from sdm.treatments t where t.slug = 'restorative'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'e3462df5-c705-4946-ab83-a1b54f14a78d', t.id, true from sdm.treatments t where t.slug = 'oral_surgery'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.organisations (id, name, owner_id) values ('9d8be4d9-21a8-45ee-a556-4f62e9093a04', 'Brentford Health & Dental', '197c4d55-6942-42d9-84c9-feccc0bb2d7f') on conflict (id) do nothing;
update sdm.profiles set organisation_id = '9d8be4d9-21a8-45ee-a556-4f62e9093a04' where id = '197c4d55-6942-42d9-84c9-feccc0bb2d7f';
insert into sdm.organisation_members (organisation_id, profile_id, membership_role) values ('9d8be4d9-21a8-45ee-a556-4f62e9093a04', '197c4d55-6942-42d9-84c9-feccc0bb2d7f', 'owner') on conflict (organisation_id, profile_id) do nothing;
insert into sdm.practice_locations (id, organisation_id, name, slug, address, postcode, town, nhs_private, accepting_new_nhs, phone, status, published_at, verified_at, bio, image_url, rating, rating_count, opening_hours, appointment_mode)
       values ('4978ecc3-8d62-48cd-91da-40e2d51345d2', '9d8be4d9-21a8-45ee-a556-4f62e9093a04', 'Brentford Health & Dental', 'brentford-health-dental', '62 High Street, Brentford', 'TW8 8EW', 'Brentford', 'mixed', true, '020 8568 3444', 'published', now(), now(), 'Brentford Health & Dental is a trusted dental practice in Brentford, offering high-quality NHS and private dental care.', '/images/practices/brentford-health-dental.webp', 5, 203, '{}'::jsonb, 'enquiry_only')
       on conflict (id) do nothing;
insert into sdm.clinic_credentials (organisation_id, auth_user_id, login_email, login_password)
       values ('9d8be4d9-21a8-45ee-a556-4f62e9093a04', '197c4d55-6942-42d9-84c9-feccc0bb2d7f', 'portal-brentford-health-dental@clinic.test', 'Moon007!786!')
       on conflict (organisation_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '4978ecc3-8d62-48cd-91da-40e2d51345d2', t.id, true from sdm.treatments t where t.slug = 'general'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '4978ecc3-8d62-48cd-91da-40e2d51345d2', t.id, true from sdm.treatments t where t.slug = 'hygiene'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '4978ecc3-8d62-48cd-91da-40e2d51345d2', t.id, true from sdm.treatments t where t.slug = 'cosmetic'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '4978ecc3-8d62-48cd-91da-40e2d51345d2', t.id, true from sdm.treatments t where t.slug = 'implants'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.organisations (id, name, owner_id) values ('6f0178b0-13b3-47a0-b780-2cc11b7d008d', 'Wisdom Dental London Road', 'e5954fd9-fc32-4159-9960-0a6eb6e96b1d') on conflict (id) do nothing;
update sdm.profiles set organisation_id = '6f0178b0-13b3-47a0-b780-2cc11b7d008d' where id = 'e5954fd9-fc32-4159-9960-0a6eb6e96b1d';
insert into sdm.organisation_members (organisation_id, profile_id, membership_role) values ('6f0178b0-13b3-47a0-b780-2cc11b7d008d', 'e5954fd9-fc32-4159-9960-0a6eb6e96b1d', 'owner') on conflict (organisation_id, profile_id) do nothing;
insert into sdm.practice_locations (id, organisation_id, name, slug, address, postcode, town, nhs_private, accepting_new_nhs, phone, status, published_at, verified_at, bio, image_url, rating, rating_count, opening_hours, appointment_mode)
       values ('1bae3bd0-7fbe-4381-a3e6-324d07f8f777', '6f0178b0-13b3-47a0-b780-2cc11b7d008d', 'Wisdom Dental London Road', 'wisdom-dental-london-road', '131 London Road, Leigh-on-Sea', 'SS9 2LA', 'Leigh-on-Sea', 'mixed', true, '01702 521277', 'published', now(), now(), 'Wisdom Dental London Road is a trusted dental practice in Leigh-on-Sea, offering high-quality NHS and private dental care.', '/images/practices/wisdom-dental-london-road.jpg', 4.9, 98, '{}'::jsonb, 'enquiry_only')
       on conflict (id) do nothing;
insert into sdm.clinic_credentials (organisation_id, auth_user_id, login_email, login_password)
       values ('6f0178b0-13b3-47a0-b780-2cc11b7d008d', 'e5954fd9-fc32-4159-9960-0a6eb6e96b1d', 'portal-wisdom-dental-london-road@clinic.test', 'Moon007!786!')
       on conflict (organisation_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '1bae3bd0-7fbe-4381-a3e6-324d07f8f777', t.id, true from sdm.treatments t where t.slug = 'general'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '1bae3bd0-7fbe-4381-a3e6-324d07f8f777', t.id, true from sdm.treatments t where t.slug = 'restorative'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '1bae3bd0-7fbe-4381-a3e6-324d07f8f777', t.id, true from sdm.treatments t where t.slug = 'emergency'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '1bae3bd0-7fbe-4381-a3e6-324d07f8f777', t.id, true from sdm.treatments t where t.slug = 'hygiene'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.organisations (id, name, owner_id) values ('d684d144-6a44-43ed-be6b-2271523ca360', 'Regent Dental', '2420ac95-7af9-4d54-9cfe-0e4dddb2f4d4') on conflict (id) do nothing;
update sdm.profiles set organisation_id = 'd684d144-6a44-43ed-be6b-2271523ca360' where id = '2420ac95-7af9-4d54-9cfe-0e4dddb2f4d4';
insert into sdm.organisation_members (organisation_id, profile_id, membership_role) values ('d684d144-6a44-43ed-be6b-2271523ca360', '2420ac95-7af9-4d54-9cfe-0e4dddb2f4d4', 'owner') on conflict (organisation_id, profile_id) do nothing;
insert into sdm.practice_locations (id, organisation_id, name, slug, address, postcode, town, nhs_private, accepting_new_nhs, phone, status, published_at, verified_at, bio, image_url, rating, rating_count, opening_hours, appointment_mode)
       values ('aa318f95-7efb-496a-92b0-3061e6d45997', 'd684d144-6a44-43ed-be6b-2271523ca360', 'Regent Dental', 'regent-dental-ilkley', '9 The Grove, Ilkley', 'LS29 9EG', 'Ilkley', 'private', false, '01943 601234', 'published', now(), now(), 'Regent Dental is a trusted dental practice in Ilkley, offering high-quality NHS and private dental care.', '/images/practices/regent-dental-ilkley.jpg', 5, 71, '{}'::jsonb, 'enquiry_only')
       on conflict (id) do nothing;
insert into sdm.clinic_credentials (organisation_id, auth_user_id, login_email, login_password)
       values ('d684d144-6a44-43ed-be6b-2271523ca360', '2420ac95-7af9-4d54-9cfe-0e4dddb2f4d4', 'portal-regent-dental-ilkley@clinic.test', 'Moon007!786!')
       on conflict (organisation_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'aa318f95-7efb-496a-92b0-3061e6d45997', t.id, true from sdm.treatments t where t.slug = 'general'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'aa318f95-7efb-496a-92b0-3061e6d45997', t.id, true from sdm.treatments t where t.slug = 'cosmetic'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'aa318f95-7efb-496a-92b0-3061e6d45997', t.id, true from sdm.treatments t where t.slug = 'implants'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'aa318f95-7efb-496a-92b0-3061e6d45997', t.id, true from sdm.treatments t where t.slug = 'orthodontic'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.organisations (id, name, owner_id) values ('b4367b73-2868-4acc-9c66-0888d0d4b640', 'Stella Dental Suite - Nottingham', 'e76b980f-9d41-4428-9c42-27580e91aaec') on conflict (id) do nothing;
update sdm.profiles set organisation_id = 'b4367b73-2868-4acc-9c66-0888d0d4b640' where id = 'e76b980f-9d41-4428-9c42-27580e91aaec';
insert into sdm.organisation_members (organisation_id, profile_id, membership_role) values ('b4367b73-2868-4acc-9c66-0888d0d4b640', 'e76b980f-9d41-4428-9c42-27580e91aaec', 'owner') on conflict (organisation_id, profile_id) do nothing;
insert into sdm.practice_locations (id, organisation_id, name, slug, address, postcode, town, nhs_private, accepting_new_nhs, phone, status, published_at, verified_at, bio, image_url, rating, rating_count, opening_hours, appointment_mode)
       values ('88be43e4-3c2a-44c1-b0e6-643f64d7b3ae', 'b4367b73-2868-4acc-9c66-0888d0d4b640', 'Stella Dental Suite - Nottingham', 'stella-dental-suite-nottingham', '42 King Street, Nottingham', 'NG1 2AS', 'Nottingham', 'private', false, '0115 941 2200', 'published', now(), now(), 'Stella Dental Suite - Nottingham is a trusted dental practice in Nottingham, offering high-quality NHS and private dental care.', '/images/practices/stella-dental-suite-nottingham.jpg', 5, 134, '{}'::jsonb, 'enquiry_only')
       on conflict (id) do nothing;
insert into sdm.clinic_credentials (organisation_id, auth_user_id, login_email, login_password)
       values ('b4367b73-2868-4acc-9c66-0888d0d4b640', 'e76b980f-9d41-4428-9c42-27580e91aaec', 'portal-stella-dental-suite-nottingham@clinic.test', 'Moon007!786!')
       on conflict (organisation_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '88be43e4-3c2a-44c1-b0e6-643f64d7b3ae', t.id, true from sdm.treatments t where t.slug = 'general'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '88be43e4-3c2a-44c1-b0e6-643f64d7b3ae', t.id, true from sdm.treatments t where t.slug = 'hygiene'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '88be43e4-3c2a-44c1-b0e6-643f64d7b3ae', t.id, true from sdm.treatments t where t.slug = 'cosmetic'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '88be43e4-3c2a-44c1-b0e6-643f64d7b3ae', t.id, true from sdm.treatments t where t.slug = 'sedation'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.organisations (id, name, owner_id) values ('2ac82605-fe4b-4e13-9238-1cad66138068', 'Stella Dental Suite - Stafford', '65e79390-fec2-4e1e-bf8d-e954218192d6') on conflict (id) do nothing;
update sdm.profiles set organisation_id = '2ac82605-fe4b-4e13-9238-1cad66138068' where id = '65e79390-fec2-4e1e-bf8d-e954218192d6';
insert into sdm.organisation_members (organisation_id, profile_id, membership_role) values ('2ac82605-fe4b-4e13-9238-1cad66138068', '65e79390-fec2-4e1e-bf8d-e954218192d6', 'owner') on conflict (organisation_id, profile_id) do nothing;
insert into sdm.practice_locations (id, organisation_id, name, slug, address, postcode, town, nhs_private, accepting_new_nhs, phone, status, published_at, verified_at, bio, image_url, rating, rating_count, opening_hours, appointment_mode)
       values ('fe71f1d4-12be-4775-a6f9-d015fae7fb21', '2ac82605-fe4b-4e13-9238-1cad66138068', 'Stella Dental Suite - Stafford', 'stella-dental-suite-stafford', '15 Greengate Street, Stafford', 'ST16 2HR', 'Stafford', 'private', false, '01785 258900', 'published', now(), now(), 'Stella Dental Suite - Stafford is a trusted dental practice in Stafford, offering high-quality NHS and private dental care.', '/images/practices/stella-dental-suite-stafford.jpg', 4.9, 89, '{}'::jsonb, 'enquiry_only')
       on conflict (id) do nothing;
insert into sdm.clinic_credentials (organisation_id, auth_user_id, login_email, login_password)
       values ('2ac82605-fe4b-4e13-9238-1cad66138068', '65e79390-fec2-4e1e-bf8d-e954218192d6', 'portal-stella-dental-suite-stafford@clinic.test', 'Moon007!786!')
       on conflict (organisation_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'fe71f1d4-12be-4775-a6f9-d015fae7fb21', t.id, true from sdm.treatments t where t.slug = 'general'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'fe71f1d4-12be-4775-a6f9-d015fae7fb21', t.id, true from sdm.treatments t where t.slug = 'hygiene'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'fe71f1d4-12be-4775-a6f9-d015fae7fb21', t.id, true from sdm.treatments t where t.slug = 'cosmetic'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'fe71f1d4-12be-4775-a6f9-d015fae7fb21', t.id, true from sdm.treatments t where t.slug = 'orthodontic'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.organisations (id, name, owner_id) values ('f1b80ec7-b5a7-406f-b92b-da5bfdf97bab', 'Dental Excellence - Liverpool', '1256c4ea-0328-4363-9fea-d61176213db0') on conflict (id) do nothing;
update sdm.profiles set organisation_id = 'f1b80ec7-b5a7-406f-b92b-da5bfdf97bab' where id = '1256c4ea-0328-4363-9fea-d61176213db0';
insert into sdm.organisation_members (organisation_id, profile_id, membership_role) values ('f1b80ec7-b5a7-406f-b92b-da5bfdf97bab', '1256c4ea-0328-4363-9fea-d61176213db0', 'owner') on conflict (organisation_id, profile_id) do nothing;
insert into sdm.practice_locations (id, organisation_id, name, slug, address, postcode, town, nhs_private, accepting_new_nhs, phone, status, published_at, verified_at, bio, image_url, rating, rating_count, opening_hours, appointment_mode)
       values ('9de70c7b-21c4-42b4-a532-8df3e9a525eb', 'f1b80ec7-b5a7-406f-b92b-da5bfdf97bab', 'Dental Excellence - Liverpool', 'dental-excellence-liverpool', '77 Dale Street, Liverpool', 'L2 2JZ', 'Liverpool', 'mixed', false, '0151 236 4455', 'published', now(), now(), 'Dental Excellence - Liverpool is a trusted dental practice in Liverpool, offering high-quality NHS and private dental care.', '/images/practices/dental-excellence-liverpool.jpg', 4.9, 176, '{}'::jsonb, 'enquiry_only')
       on conflict (id) do nothing;
insert into sdm.clinic_credentials (organisation_id, auth_user_id, login_email, login_password)
       values ('f1b80ec7-b5a7-406f-b92b-da5bfdf97bab', '1256c4ea-0328-4363-9fea-d61176213db0', 'portal-dental-excellence-liverpool@clinic.test', 'Moon007!786!')
       on conflict (organisation_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '9de70c7b-21c4-42b4-a532-8df3e9a525eb', t.id, true from sdm.treatments t where t.slug = 'general'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '9de70c7b-21c4-42b4-a532-8df3e9a525eb', t.id, true from sdm.treatments t where t.slug = 'implants'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '9de70c7b-21c4-42b4-a532-8df3e9a525eb', t.id, true from sdm.treatments t where t.slug = 'cosmetic'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '9de70c7b-21c4-42b4-a532-8df3e9a525eb', t.id, true from sdm.treatments t where t.slug = 'emergency'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.organisations (id, name, owner_id) values ('2f0f9d85-d34e-452f-b767-98b9db705965', 'Kaizen Dental', '516a81f8-6b41-485e-b9a1-d7776df15314') on conflict (id) do nothing;
update sdm.profiles set organisation_id = '2f0f9d85-d34e-452f-b767-98b9db705965' where id = '516a81f8-6b41-485e-b9a1-d7776df15314';
insert into sdm.organisation_members (organisation_id, profile_id, membership_role) values ('2f0f9d85-d34e-452f-b767-98b9db705965', '516a81f8-6b41-485e-b9a1-d7776df15314', 'owner') on conflict (organisation_id, profile_id) do nothing;
insert into sdm.practice_locations (id, organisation_id, name, slug, address, postcode, town, nhs_private, accepting_new_nhs, phone, status, published_at, verified_at, bio, image_url, rating, rating_count, opening_hours, appointment_mode)
       values ('db80d42d-3fcc-49d0-a3ef-b0dfc7bef4b7', '2f0f9d85-d34e-452f-b767-98b9db705965', 'Kaizen Dental', 'kaizen-dental-market-harborough', '31 High Street, Market Harborough', 'LE16 7AL', 'Market Harborough', 'private', false, '01858 410233', 'published', now(), now(), 'Kaizen Dental is a trusted dental practice in Market Harborough, offering high-quality NHS and private dental care.', '/images/practices/kaizen-dental-market-harborough.jpg', 4.9, 102, '{}'::jsonb, 'enquiry_only')
       on conflict (id) do nothing;
insert into sdm.clinic_credentials (organisation_id, auth_user_id, login_email, login_password)
       values ('2f0f9d85-d34e-452f-b767-98b9db705965', '516a81f8-6b41-485e-b9a1-d7776df15314', 'portal-kaizen-dental-market-harborough@clinic.test', 'Moon007!786!')
       on conflict (organisation_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'db80d42d-3fcc-49d0-a3ef-b0dfc7bef4b7', t.id, true from sdm.treatments t where t.slug = 'general'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'db80d42d-3fcc-49d0-a3ef-b0dfc7bef4b7', t.id, true from sdm.treatments t where t.slug = 'hygiene'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'db80d42d-3fcc-49d0-a3ef-b0dfc7bef4b7', t.id, true from sdm.treatments t where t.slug = 'restorative'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'db80d42d-3fcc-49d0-a3ef-b0dfc7bef4b7', t.id, true from sdm.treatments t where t.slug = 'cosmetic'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.organisations (id, name, owner_id) values ('7e1d43c4-92f2-4907-a636-fb307aab921c', 'Bond Dental London (MAYFAIR)', '4784830c-4032-4064-b6ae-1ba8376cd42e') on conflict (id) do nothing;
update sdm.profiles set organisation_id = '7e1d43c4-92f2-4907-a636-fb307aab921c' where id = '4784830c-4032-4064-b6ae-1ba8376cd42e';
insert into sdm.organisation_members (organisation_id, profile_id, membership_role) values ('7e1d43c4-92f2-4907-a636-fb307aab921c', '4784830c-4032-4064-b6ae-1ba8376cd42e', 'owner') on conflict (organisation_id, profile_id) do nothing;
insert into sdm.practice_locations (id, organisation_id, name, slug, address, postcode, town, nhs_private, accepting_new_nhs, phone, status, published_at, verified_at, bio, image_url, rating, rating_count, opening_hours, appointment_mode)
       values ('5227d8a1-a656-4d5c-ba78-b72c0e908f71', '7e1d43c4-92f2-4907-a636-fb307aab921c', 'Bond Dental London (MAYFAIR)', 'bond-dental-london-mayfair', '22 Grosvenor Street, London', 'W1K 4QP', 'London', 'private', false, '020 7499 1122', 'published', now(), now(), 'Bond Dental London (MAYFAIR) is a trusted dental practice in London, offering high-quality NHS and private dental care.', '/images/practices/bond-dental-london-mayfair.jpg', 4.5, 245, '{}'::jsonb, 'enquiry_only')
       on conflict (id) do nothing;
insert into sdm.clinic_credentials (organisation_id, auth_user_id, login_email, login_password)
       values ('7e1d43c4-92f2-4907-a636-fb307aab921c', '4784830c-4032-4064-b6ae-1ba8376cd42e', 'portal-bond-dental-london-mayfair@clinic.test', 'Moon007!786!')
       on conflict (organisation_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '5227d8a1-a656-4d5c-ba78-b72c0e908f71', t.id, true from sdm.treatments t where t.slug = 'general'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '5227d8a1-a656-4d5c-ba78-b72c0e908f71', t.id, true from sdm.treatments t where t.slug = 'cosmetic'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '5227d8a1-a656-4d5c-ba78-b72c0e908f71', t.id, true from sdm.treatments t where t.slug = 'implants'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '5227d8a1-a656-4d5c-ba78-b72c0e908f71', t.id, true from sdm.treatments t where t.slug = 'orthodontic'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '5227d8a1-a656-4d5c-ba78-b72c0e908f71', t.id, true from sdm.treatments t where t.slug = 'sedation'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.organisations (id, name, owner_id) values ('5e499dc9-7224-43b9-86cd-63ec5a08c4c7', 'Dental Excellence Chelsea', 'ce68d996-b89b-4a45-897f-e38876f3a0dc') on conflict (id) do nothing;
update sdm.profiles set organisation_id = '5e499dc9-7224-43b9-86cd-63ec5a08c4c7' where id = 'ce68d996-b89b-4a45-897f-e38876f3a0dc';
insert into sdm.organisation_members (organisation_id, profile_id, membership_role) values ('5e499dc9-7224-43b9-86cd-63ec5a08c4c7', 'ce68d996-b89b-4a45-897f-e38876f3a0dc', 'owner') on conflict (organisation_id, profile_id) do nothing;
insert into sdm.practice_locations (id, organisation_id, name, slug, address, postcode, town, nhs_private, accepting_new_nhs, phone, status, published_at, verified_at, bio, image_url, rating, rating_count, opening_hours, appointment_mode)
       values ('0af660e9-de2f-4f9a-b232-69794683bcb1', '5e499dc9-7224-43b9-86cd-63ec5a08c4c7', 'Dental Excellence Chelsea', 'dental-excellence-chelsea', '8 Duke Street, London', 'SW3 4LY', 'London', 'private', false, '020 7352 6688', 'published', now(), now(), 'Dental Excellence Chelsea is a trusted dental practice in London, offering high-quality NHS and private dental care.', '/images/practices/dental-excellence-chelsea.webp', 5, 189, '{}'::jsonb, 'enquiry_only')
       on conflict (id) do nothing;
insert into sdm.clinic_credentials (organisation_id, auth_user_id, login_email, login_password)
       values ('5e499dc9-7224-43b9-86cd-63ec5a08c4c7', 'ce68d996-b89b-4a45-897f-e38876f3a0dc', 'portal-dental-excellence-chelsea@clinic.test', 'Moon007!786!')
       on conflict (organisation_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '0af660e9-de2f-4f9a-b232-69794683bcb1', t.id, true from sdm.treatments t where t.slug = 'general'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '0af660e9-de2f-4f9a-b232-69794683bcb1', t.id, true from sdm.treatments t where t.slug = 'hygiene'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '0af660e9-de2f-4f9a-b232-69794683bcb1', t.id, true from sdm.treatments t where t.slug = 'cosmetic'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '0af660e9-de2f-4f9a-b232-69794683bcb1', t.id, true from sdm.treatments t where t.slug = 'implants'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.organisations (id, name, owner_id) values ('071a7aa4-2b4c-4b60-8fd1-7a08333d7f85', 'Priors Hall Dental', '3737bf88-4320-47f4-8dda-3f4ce902de51') on conflict (id) do nothing;
update sdm.profiles set organisation_id = '071a7aa4-2b4c-4b60-8fd1-7a08333d7f85' where id = '3737bf88-4320-47f4-8dda-3f4ce902de51';
insert into sdm.organisation_members (organisation_id, profile_id, membership_role) values ('071a7aa4-2b4c-4b60-8fd1-7a08333d7f85', '3737bf88-4320-47f4-8dda-3f4ce902de51', 'owner') on conflict (organisation_id, profile_id) do nothing;
insert into sdm.practice_locations (id, organisation_id, name, slug, address, postcode, town, nhs_private, accepting_new_nhs, phone, status, published_at, verified_at, bio, image_url, rating, rating_count, opening_hours, appointment_mode)
       values ('dbc57011-3fe1-445f-a3d4-bca1c773d16c', '071a7aa4-2b4c-4b60-8fd1-7a08333d7f85', 'Priors Hall Dental', 'priors-hall-dental-corby', 'Priors Hall Road, Corby', 'NN17 5EA', 'Corby', 'mixed', true, '01536 203456', 'published', now(), now(), 'Priors Hall Dental is a trusted dental practice in Corby, offering high-quality NHS and private dental care.', '/images/practices/priors-hall-dental-corby.jpg', 5, 55, '{}'::jsonb, 'enquiry_only')
       on conflict (id) do nothing;
insert into sdm.clinic_credentials (organisation_id, auth_user_id, login_email, login_password)
       values ('071a7aa4-2b4c-4b60-8fd1-7a08333d7f85', '3737bf88-4320-47f4-8dda-3f4ce902de51', 'portal-priors-hall-dental-corby@clinic.test', 'Moon007!786!')
       on conflict (organisation_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'dbc57011-3fe1-445f-a3d4-bca1c773d16c', t.id, true from sdm.treatments t where t.slug = 'general'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'dbc57011-3fe1-445f-a3d4-bca1c773d16c', t.id, true from sdm.treatments t where t.slug = 'hygiene'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'dbc57011-3fe1-445f-a3d4-bca1c773d16c', t.id, true from sdm.treatments t where t.slug = 'emergency'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select 'dbc57011-3fe1-445f-a3d4-bca1c773d16c', t.id, true from sdm.treatments t where t.slug = 'restorative'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.organisations (id, name, owner_id) values ('dec07986-f253-43db-8634-421eda284239', 'Bond Dental London (NOTTING HILL)', 'a485cf5a-096e-4a76-9c11-bdd71e42709a') on conflict (id) do nothing;
update sdm.profiles set organisation_id = 'dec07986-f253-43db-8634-421eda284239' where id = 'a485cf5a-096e-4a76-9c11-bdd71e42709a';
insert into sdm.organisation_members (organisation_id, profile_id, membership_role) values ('dec07986-f253-43db-8634-421eda284239', 'a485cf5a-096e-4a76-9c11-bdd71e42709a', 'owner') on conflict (organisation_id, profile_id) do nothing;
insert into sdm.practice_locations (id, organisation_id, name, slug, address, postcode, town, nhs_private, accepting_new_nhs, phone, status, published_at, verified_at, bio, image_url, rating, rating_count, opening_hours, appointment_mode)
       values ('8a31b12e-5ed2-477c-b2bd-5945c676dc8b', 'dec07986-f253-43db-8634-421eda284239', 'Bond Dental London (NOTTING HILL)', 'bond-dental-london-notting-hill', '55 Westbourne Grove, London', 'W2 5SH', 'London', 'private', false, '020 7229 3344', 'published', now(), now(), 'Bond Dental London (NOTTING HILL) is a trusted dental practice in London, offering high-quality NHS and private dental care.', '/images/practices/bond-dental-london-notting-hill.jpg', 4.6, 141, '{}'::jsonb, 'enquiry_only')
       on conflict (id) do nothing;
insert into sdm.clinic_credentials (organisation_id, auth_user_id, login_email, login_password)
       values ('dec07986-f253-43db-8634-421eda284239', 'a485cf5a-096e-4a76-9c11-bdd71e42709a', 'portal-bond-dental-london-notting-hill@clinic.test', 'Moon007!786!')
       on conflict (organisation_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '8a31b12e-5ed2-477c-b2bd-5945c676dc8b', t.id, true from sdm.treatments t where t.slug = 'general'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '8a31b12e-5ed2-477c-b2bd-5945c676dc8b', t.id, true from sdm.treatments t where t.slug = 'cosmetic'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '8a31b12e-5ed2-477c-b2bd-5945c676dc8b', t.id, true from sdm.treatments t where t.slug = 'implants'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '8a31b12e-5ed2-477c-b2bd-5945c676dc8b', t.id, true from sdm.treatments t where t.slug = 'orthodontic'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.organisations (id, name, owner_id) values ('b6cc28be-4ae3-4d80-9ebf-361232a6a755', 'House of Dental', '3ab7dbcf-bf22-4da6-80f1-8779831469f7') on conflict (id) do nothing;
update sdm.profiles set organisation_id = 'b6cc28be-4ae3-4d80-9ebf-361232a6a755' where id = '3ab7dbcf-bf22-4da6-80f1-8779831469f7';
insert into sdm.organisation_members (organisation_id, profile_id, membership_role) values ('b6cc28be-4ae3-4d80-9ebf-361232a6a755', '3ab7dbcf-bf22-4da6-80f1-8779831469f7', 'owner') on conflict (organisation_id, profile_id) do nothing;
insert into sdm.practice_locations (id, organisation_id, name, slug, address, postcode, town, nhs_private, accepting_new_nhs, phone, status, published_at, verified_at, bio, image_url, rating, rating_count, opening_hours, appointment_mode)
       values ('8a771e2a-5e78-4680-b2c3-79acc6dcf93c', 'b6cc28be-4ae3-4d80-9ebf-361232a6a755', 'House of Dental', 'house-of-dental-hinckley', '12 Castle Street, Hinckley', 'LE10 1DT', 'Hinckley', 'mixed', false, '01455 638190', 'published', now(), now(), 'House of Dental is a trusted dental practice in Hinckley, offering high-quality NHS and private dental care.', '/images/practices/house-of-dental-hinckley.jpg', 4.9, 127, '{}'::jsonb, 'enquiry_only')
       on conflict (id) do nothing;
insert into sdm.clinic_credentials (organisation_id, auth_user_id, login_email, login_password)
       values ('b6cc28be-4ae3-4d80-9ebf-361232a6a755', '3ab7dbcf-bf22-4da6-80f1-8779831469f7', 'portal-house-of-dental-hinckley@clinic.test', 'Moon007!786!')
       on conflict (organisation_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '8a771e2a-5e78-4680-b2c3-79acc6dcf93c', t.id, true from sdm.treatments t where t.slug = 'general'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '8a771e2a-5e78-4680-b2c3-79acc6dcf93c', t.id, true from sdm.treatments t where t.slug = 'hygiene'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '8a771e2a-5e78-4680-b2c3-79acc6dcf93c', t.id, true from sdm.treatments t where t.slug = 'restorative'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '8a771e2a-5e78-4680-b2c3-79acc6dcf93c', t.id, true from sdm.treatments t where t.slug = 'emergency'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.organisations (id, name, owner_id) values ('b9dc1d92-fd3a-48a0-81d4-09e945e00748', 'Dental Excellence Westfield London', '0073d06e-bb7b-430e-a04e-df31d6520461') on conflict (id) do nothing;
update sdm.profiles set organisation_id = 'b9dc1d92-fd3a-48a0-81d4-09e945e00748' where id = '0073d06e-bb7b-430e-a04e-df31d6520461';
insert into sdm.organisation_members (organisation_id, profile_id, membership_role) values ('b9dc1d92-fd3a-48a0-81d4-09e945e00748', '0073d06e-bb7b-430e-a04e-df31d6520461', 'owner') on conflict (organisation_id, profile_id) do nothing;
insert into sdm.practice_locations (id, organisation_id, name, slug, address, postcode, town, nhs_private, accepting_new_nhs, phone, status, published_at, verified_at, bio, image_url, rating, rating_count, opening_hours, appointment_mode)
       values ('8de2f5ff-115a-46ac-9593-82cad901d030', 'b9dc1d92-fd3a-48a0-81d4-09e945e00748', 'Dental Excellence Westfield London', 'dental-excellence-westfield-london', 'Unit 2056, Westfield London, Ariel Way, London', 'W12 7GF', 'London', 'private', false, '020 8749 0099', 'published', now(), now(), 'Dental Excellence Westfield London is a trusted dental practice in London, offering high-quality NHS and private dental care.', '/images/practices/dental-excellence-westfield-london.webp', 4.7, 93, '{}'::jsonb, 'enquiry_only')
       on conflict (id) do nothing;
insert into sdm.clinic_credentials (organisation_id, auth_user_id, login_email, login_password)
       values ('b9dc1d92-fd3a-48a0-81d4-09e945e00748', '0073d06e-bb7b-430e-a04e-df31d6520461', 'portal-dental-excellence-westfield-london@clinic.test', 'Moon007!786!')
       on conflict (organisation_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '8de2f5ff-115a-46ac-9593-82cad901d030', t.id, true from sdm.treatments t where t.slug = 'general'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '8de2f5ff-115a-46ac-9593-82cad901d030', t.id, true from sdm.treatments t where t.slug = 'cosmetic'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '8de2f5ff-115a-46ac-9593-82cad901d030', t.id, true from sdm.treatments t where t.slug = 'implants'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '8de2f5ff-115a-46ac-9593-82cad901d030', t.id, true from sdm.treatments t where t.slug = 'sedation'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.organisations (id, name, owner_id) values ('978b19b0-bb19-48d8-9f4b-9c1cc3b5468b', 'NUYU Dental & Aesthetics Bristol', 'c5dc8e94-0a84-4e9f-8cbc-9d9aa2308fb4') on conflict (id) do nothing;
update sdm.profiles set organisation_id = '978b19b0-bb19-48d8-9f4b-9c1cc3b5468b' where id = 'c5dc8e94-0a84-4e9f-8cbc-9d9aa2308fb4';
insert into sdm.organisation_members (organisation_id, profile_id, membership_role) values ('978b19b0-bb19-48d8-9f4b-9c1cc3b5468b', 'c5dc8e94-0a84-4e9f-8cbc-9d9aa2308fb4', 'owner') on conflict (organisation_id, profile_id) do nothing;
insert into sdm.practice_locations (id, organisation_id, name, slug, address, postcode, town, nhs_private, accepting_new_nhs, phone, status, published_at, verified_at, bio, image_url, rating, rating_count, opening_hours, appointment_mode)
       values ('6b12e121-cfdb-43cc-b3cc-f7d357b742f9', '978b19b0-bb19-48d8-9f4b-9c1cc3b5468b', 'NUYU Dental & Aesthetics Bristol', 'nuyu-dental-aesthetics-bristol', '9 Corn Street, Bristol', 'BS1 1JQ', 'Bristol', 'private', false, '0117 244 6677', 'published', now(), now(), 'NUYU Dental & Aesthetics Bristol is a trusted dental practice in Bristol, offering high-quality NHS and private dental care.', '/images/practices/nuyu-dental-aesthetics-bristol.jpg', 4.9, 118, '{}'::jsonb, 'enquiry_only')
       on conflict (id) do nothing;
insert into sdm.clinic_credentials (organisation_id, auth_user_id, login_email, login_password)
       values ('978b19b0-bb19-48d8-9f4b-9c1cc3b5468b', 'c5dc8e94-0a84-4e9f-8cbc-9d9aa2308fb4', 'portal-nuyu-dental-aesthetics-bristol@clinic.test', 'Moon007!786!')
       on conflict (organisation_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '6b12e121-cfdb-43cc-b3cc-f7d357b742f9', t.id, true from sdm.treatments t where t.slug = 'general'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '6b12e121-cfdb-43cc-b3cc-f7d357b742f9', t.id, true from sdm.treatments t where t.slug = 'hygiene'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '6b12e121-cfdb-43cc-b3cc-f7d357b742f9', t.id, true from sdm.treatments t where t.slug = 'cosmetic'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '6b12e121-cfdb-43cc-b3cc-f7d357b742f9', t.id, true from sdm.treatments t where t.slug = 'oral_surgery'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.organisations (id, name, owner_id) values ('c5a39a57-c97c-4494-8d6f-7abc916ef0cb', 'Bond Dental London (KENSINGTON)', '94fa3097-df5a-42dc-8157-9d06f6272ae2') on conflict (id) do nothing;
update sdm.profiles set organisation_id = 'c5a39a57-c97c-4494-8d6f-7abc916ef0cb' where id = '94fa3097-df5a-42dc-8157-9d06f6272ae2';
insert into sdm.organisation_members (organisation_id, profile_id, membership_role) values ('c5a39a57-c97c-4494-8d6f-7abc916ef0cb', '94fa3097-df5a-42dc-8157-9d06f6272ae2', 'owner') on conflict (organisation_id, profile_id) do nothing;
insert into sdm.practice_locations (id, organisation_id, name, slug, address, postcode, town, nhs_private, accepting_new_nhs, phone, status, published_at, verified_at, bio, image_url, rating, rating_count, opening_hours, appointment_mode)
       values ('71132563-356a-4883-b9d6-43567d0bdf32', 'c5a39a57-c97c-4494-8d6f-7abc916ef0cb', 'Bond Dental London (KENSINGTON)', 'bond-dental-london-kensington', '14 Kensington High Street, London', 'W8 5NP', 'London', 'private', false, '020 7368 2200', 'published', now(), now(), 'Bond Dental London (KENSINGTON) is a trusted dental practice in London, offering high-quality NHS and private dental care.', '/images/practices/bond-dental-london-kensington.jpg', 4.8, 167, '{}'::jsonb, 'enquiry_only')
       on conflict (id) do nothing;
insert into sdm.clinic_credentials (organisation_id, auth_user_id, login_email, login_password)
       values ('c5a39a57-c97c-4494-8d6f-7abc916ef0cb', '94fa3097-df5a-42dc-8157-9d06f6272ae2', 'portal-bond-dental-london-kensington@clinic.test', 'Moon007!786!')
       on conflict (organisation_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '71132563-356a-4883-b9d6-43567d0bdf32', t.id, true from sdm.treatments t where t.slug = 'general'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '71132563-356a-4883-b9d6-43567d0bdf32', t.id, true from sdm.treatments t where t.slug = 'cosmetic'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '71132563-356a-4883-b9d6-43567d0bdf32', t.id, true from sdm.treatments t where t.slug = 'implants'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '71132563-356a-4883-b9d6-43567d0bdf32', t.id, true from sdm.treatments t where t.slug = 'orthodontic'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.organisations (id, name, owner_id) values ('61899893-25ab-43cc-a912-0bc96d728858', 'NuYu Dental', '4e1ebd76-0b7b-4bd1-ab0a-01d3b04ddd2f') on conflict (id) do nothing;
update sdm.profiles set organisation_id = '61899893-25ab-43cc-a912-0bc96d728858' where id = '4e1ebd76-0b7b-4bd1-ab0a-01d3b04ddd2f';
insert into sdm.organisation_members (organisation_id, profile_id, membership_role) values ('61899893-25ab-43cc-a912-0bc96d728858', '4e1ebd76-0b7b-4bd1-ab0a-01d3b04ddd2f', 'owner') on conflict (organisation_id, profile_id) do nothing;
insert into sdm.practice_locations (id, organisation_id, name, slug, address, postcode, town, nhs_private, accepting_new_nhs, phone, status, published_at, verified_at, bio, image_url, rating, rating_count, opening_hours, appointment_mode)
       values ('35155648-39b1-4d05-bd16-230f0139d291', '61899893-25ab-43cc-a912-0bc96d728858', 'NuYu Dental', 'nuyu-dental-cheltenham', '7 Promenade, Cheltenham', 'GL50 1SX', 'Cheltenham', 'private', false, '01242 380111', 'published', now(), now(), 'NuYu Dental is a trusted dental practice in Cheltenham, offering high-quality NHS and private dental care.', '/images/practices/nuyu-dental-cheltenham.jpg', 5, 145, '{}'::jsonb, 'enquiry_only')
       on conflict (id) do nothing;
insert into sdm.clinic_credentials (organisation_id, auth_user_id, login_email, login_password)
       values ('61899893-25ab-43cc-a912-0bc96d728858', '4e1ebd76-0b7b-4bd1-ab0a-01d3b04ddd2f', 'portal-nuyu-dental-cheltenham@clinic.test', 'Moon007!786!')
       on conflict (organisation_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '35155648-39b1-4d05-bd16-230f0139d291', t.id, true from sdm.treatments t where t.slug = 'general'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '35155648-39b1-4d05-bd16-230f0139d291', t.id, true from sdm.treatments t where t.slug = 'hygiene'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '35155648-39b1-4d05-bd16-230f0139d291', t.id, true from sdm.treatments t where t.slug = 'cosmetic'
         on conflict (practice_location_id, treatment_id) do nothing;
insert into sdm.practice_treatments (practice_location_id, treatment_id, is_offered)
         select '35155648-39b1-4d05-bd16-230f0139d291', t.id, true from sdm.treatments t where t.slug = 'sedation'
         on conflict (practice_location_id, treatment_id) do nothing;
