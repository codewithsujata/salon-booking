-- Run this in your Supabase SQL editor

-- ─────────────────────────────────────
-- SERVICES TABLE
-- ─────────────────────────────────────
create table if not exists services (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  duration integer,              -- minutes (optional)
  price numeric(10,2) not null,
  description text,
  image_url text,                -- uploaded via Supabase Storage
  active boolean default true,
  created_at timestamptz default now()
);

alter table services enable row level security;

create policy "allow_read_active_services" on services
  for select to anon using (active = true);

create policy "allow_service_role_all_services" on services
  for all to service_role using (true);

-- ─────────────────────────────────────
-- CUSTOMERS TABLE
-- ─────────────────────────────────────
create table if not exists customers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null unique,
  email text,
  total_bookings integer default 1,
  created_at timestamptz default now(),
  last_booking_at timestamptz default now()
);

alter table customers enable row level security;

create policy "allow_service_role_all_customers" on customers
  for all to service_role using (true);

-- ─────────────────────────────────────
create table if not exists appointments (
  id uuid default gen_random_uuid() primary key,
  client_name text not null,
  client_phone text not null,
  client_email text,
  service_id text not null,
  service_name text not null,
  date date not null,
  time time not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_appointments_date_time on appointments(date, time);

alter table appointments enable row level security;

create policy "allow_insert" on appointments
  for insert to anon with check (true);

create policy "allow_service_role_all" on appointments
  for all to service_role using (true);

-- ─────────────────────────────────────
-- STORAGE BUCKET (run once manually in
-- Supabase Dashboard > Storage > New bucket)
-- Name: service-images
-- Public: true
-- ─────────────────────────────────────
-- Or run this:
-- insert into storage.buckets (id, name, public) values ('service-images', 'service-images', true);
-- create policy "public read" on storage.objects for select using (bucket_id = 'service-images');
-- create policy "service role upload" on storage.objects for insert to service_role with check (bucket_id = 'service-images');
