-- Run in Supabase SQL Editor (FoodLink MVP)

create extension if not exists "pgcrypto";

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  name text not null default '',
  org_type text not null default 'generator',
  contact_email text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.waste_listings (
  id uuid primary key default gen_random_uuid(),
  generator_id uuid not null references public.organizations (id) on delete cascade,
  status text not null default 'active',
  waste_type text not null,
  quantity text not null,
  address_full text not null,
  address_display text not null,
  notes text,
  created_at timestamptz not null default now(),
  constraint waste_listings_status_check check (status in ('active', 'cancelled'))
);

alter table public.organizations enable row level security;
alter table public.waste_listings enable row level security;

-- organizations: users read/update own row (anon uses service role on API only)
create policy "orgs_select_own"
  on public.organizations for select
  using (clerk_user_id = (auth.jwt() ->> 'sub'));

create policy "orgs_insert_own"
  on public.organizations for insert
  with check (clerk_user_id = (auth.jwt() ->> 'sub'));

create policy "orgs_update_own"
  on public.organizations for update
  using (clerk_user_id = (auth.jwt() ->> 'sub'));

-- waste_listings: public read active; owners full access
create policy "listings_public_read_active"
  on public.waste_listings for select
  using (status = 'active');

create policy "listings_owner_all"
  on public.waste_listings for all
  using (
    generator_id in (
      select id from public.organizations
      where clerk_user_id = (auth.jwt() ->> 'sub')
    )
  )
  with check (
    generator_id in (
      select id from public.organizations
      where clerk_user_id = (auth.jwt() ->> 'sub')
    )
  );
