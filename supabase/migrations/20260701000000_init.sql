-- Create Hunts table
create table if not exists hunts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'DRAFT', -- DRAFT | ACTIVE | COMPLETED
  start_at timestamptz,
  end_at timestamptz,
  created_at timestamptz default now()
);

-- Create QR Codes table
create table if not exists qr_codes (
  id uuid primary key default gen_random_uuid(),
  hunt_id uuid references hunts(id) on delete cascade,
  code text unique not null,
  label text not null,
  sequence_order int,
  points int not null default 10,
  clue_payload jsonb not null default '{}', -- { title, text, imageUrl? }
  location_lat float,
  location_lng float,
  max_scans int,
  scan_count int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create Scans table (written by PWA)
create table if not exists scans (
  id uuid primary key default gen_random_uuid(),
  qr_id uuid references qr_codes(id) on delete cascade,
  user_id text not null,
  scanned_at timestamptz default now(),
  result text not null, -- SUCCESS | DUPLICATE | EXPIRED | INVALID
  device_meta jsonb
);

-- Enable RLS (Optional, but if we do, we can add simple rules or allow operations)
-- For this dashboard we can disable/bypass RLS or write open policies since they use the admin secret / anon client.
-- Let's make sure that anyone can read/write scans, and manage hunts/qr_codes.
alter table hunts disable row level security;
alter table qr_codes disable row level security;
alter table scans disable row level security;

-- RPC to safely increment scan count
create or replace function increment_scan_count(qr_id uuid)
returns void as $$
begin
  update qr_codes
  set scan_count = scan_count + 1
  where id = qr_id;
end;
$$ language plpgsql security definer;
