create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),

  slug text not null unique,
  name text not null,
  description text,

  is_active boolean not null default true,

  max_websites integer not null default 1
    check (max_websites > 0),

  storage_limit_bytes bigint not null
    check (storage_limit_bytes >= 0),

  bandwidth_limit_bytes bigint not null
    check (bandwidth_limit_bytes >= 0),

  request_limit bigint not null
    check (request_limit >= 0),

  build_minutes_limit integer not null
    check (build_minutes_limit >= 0),

  concurrent_build_limit integer not null default 1
    check (concurrent_build_limit > 0),

  custom_domain_limit integer not null default 1
    check (custom_domain_limit >= 0),

  backup_retention_days integer not null default 7
    check (backup_retention_days >= 0),

  backup_limit integer not null default 1
    check (backup_limit >= 0),

  max_upload_bytes bigint not null
    check (max_upload_bytes >= 0),

  build_timeout_seconds integer not null default 600
    check (build_timeout_seconds > 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.hosting_services (
  id uuid primary key default gen_random_uuid(),

  owner_id uuid not null
    references auth.users(id) on delete restrict,

  plan_id uuid not null
    references public.plans(id) on delete restrict,

  billing_service_id text unique,

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'active',
        'suspended',
        'cancelled'
      )
    ),

  activated_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_entitlements (
  hosting_service_id uuid primary key
    references public.hosting_services(id) on delete cascade,

  max_websites integer not null
    check (max_websites > 0),

  storage_limit_bytes bigint not null
    check (storage_limit_bytes >= 0),

  bandwidth_limit_bytes bigint not null
    check (bandwidth_limit_bytes >= 0),

  request_limit bigint not null
    check (request_limit >= 0),

  build_minutes_limit integer not null
    check (build_minutes_limit >= 0),

  concurrent_build_limit integer not null
    check (concurrent_build_limit > 0),

  custom_domain_limit integer not null
    check (custom_domain_limit >= 0),

  backup_retention_days integer not null
    check (backup_retention_days >= 0),

  backup_limit integer not null
    check (backup_limit >= 0),

  max_upload_bytes bigint not null
    check (max_upload_bytes >= 0),

  build_timeout_seconds integer not null
    check (build_timeout_seconds > 0),

  updated_at timestamptz not null default now()
);

create table public.websites (
  id uuid primary key default gen_random_uuid(),

  hosting_service_id uuid not null
    references public.hosting_services(id) on delete restrict,

  name text not null,

  slug text not null unique
    check (
      slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    ),

  default_hostname text not null unique,

  framework text,

  setup_status text not null default 'not_started'
    check (
      setup_status in (
        'not_started',
        'in_progress',
        'completed'
      )
    ),

  operational_status text not null default 'offline'
    check (
      operational_status in (
        'offline',
        'online',
        'building',
        'failed',
        'suspended'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.website_members (
  website_id uuid not null
    references public.websites(id) on delete cascade,

  user_id uuid not null
    references auth.users(id) on delete cascade,

  role text not null default 'viewer'
    check (
      role in (
        'owner',
        'admin',
        'developer',
        'viewer'
      )
    ),

  created_at timestamptz not null default now(),

  primary key (
    website_id,
    user_id
  )
);

create index hosting_services_owner_id_idx
  on public.hosting_services(owner_id);

create index hosting_services_plan_id_idx
  on public.hosting_services(plan_id);

create index hosting_services_status_idx
  on public.hosting_services(status);

create index websites_hosting_service_id_idx
  on public.websites(hosting_service_id);

create index websites_setup_status_idx
  on public.websites(setup_status);

create index websites_operational_status_idx
  on public.websites(operational_status);

create index websites_deleted_at_idx
  on public.websites(deleted_at);

create index website_members_user_id_idx
  on public.website_members(user_id);

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger plans_set_updated_at
before update on public.plans
for each row
execute function public.set_updated_at();

create trigger hosting_services_set_updated_at
before update on public.hosting_services
for each row
execute function public.set_updated_at();

create trigger service_entitlements_set_updated_at
before update on public.service_entitlements
for each row
execute function public.set_updated_at();

create trigger websites_set_updated_at
before update on public.websites
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    full_name
  )
  values (
    new.id,
    nullif(
      new.raw_user_meta_data ->> 'full_name',
      ''
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.can_access_website(
  target_website_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.websites w
    join public.hosting_services hs
      on hs.id = w.hosting_service_id
    where
      w.id = target_website_id
      and w.deleted_at is null
      and (
        hs.owner_id = auth.uid()
        or exists (
          select 1
          from public.website_members wm
          where
            wm.website_id = w.id
            and wm.user_id = auth.uid()
        )
      )
  );
$$;

alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.hosting_services enable row level security;
alter table public.service_entitlements enable row level security;
alter table public.websites enable row level security;
alter table public.website_members enable row level security;

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
)
with check (
  id = auth.uid()
);

create policy "Authenticated users can view active plans"
on public.plans
for select
to authenticated
using (
  is_active = true
);

create policy "Owners can view their hosting services"
on public.hosting_services
for select
to authenticated
using (
  owner_id = auth.uid()
);

create policy "Owners can view their service entitlements"
on public.service_entitlements
for select
to authenticated
using (
  exists (
    select 1
    from public.hosting_services hs
    where
      hs.id = hosting_service_id
      and hs.owner_id = auth.uid()
  )
);

create policy "Members can view accessible websites"
on public.websites
for select
to authenticated
using (
  public.can_access_website(id)
);

create policy "Members can view memberships for accessible websites"
on public.website_members
for select
to authenticated
using (
  public.can_access_website(website_id)
);