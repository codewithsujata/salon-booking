-- Run this in your Supabase SQL editor

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

-- Index for fast slot lookup
create index if not exists idx_appointments_date_time on appointments(date, time);

-- Enable Row Level Security
alter table appointments enable row level security;

-- Allow anonymous inserts (clients booking)
create policy "allow_insert" on appointments
  for insert to anon with check (true);

-- Only service role can read/update (admin dashboard uses service role key)
create policy "allow_service_role_all" on appointments
  for all to service_role using (true);
