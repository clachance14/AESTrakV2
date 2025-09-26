-- Initial schema for AESTrak v2

create extension if not exists "pgcrypto";

-- Enumerations
create type public.alert_level as enum ('on_track', 'warning', 'critical', 'over_budget');
create type public.alert_status as enum ('active', 'acknowledged', 'resolved');
create type public.import_job_type as enum ('purchase_orders', 'quantity_surveys');
create type public.import_job_status as enum ('pending', 'processing', 'succeeded', 'failed');
create type public.member_role as enum ('admin', 'member');
create type public.member_status as enum ('invited', 'active');

-- Organizations
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'essential',
  stripe_customer_id text,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_plan_check check (plan in ('essential', 'growth', 'enterprise'))
);

create index organizations_plan_idx on public.organizations (plan);

-- Organization members
create table public.organization_members (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id),
  role public.member_role not null default 'member',
  status public.member_status not null default 'invited',
  invited_at timestamptz not null default now(),
  joined_at timestamptz,
  constraint organization_members_pk primary key (organization_id, user_id)
);

create index organization_members_user_idx on public.organization_members (user_id);
create index organization_members_status_invited_idx on public.organization_members (status) where status = 'invited';

-- Helper functions for RLS
create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = org_id
      and om.user_id = auth.uid()
      and om.status = 'active'
  );
$$;

grant execute on function public.is_org_member(uuid) to authenticated;

create or replace function public.is_org_admin(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = org_id
      and om.user_id = auth.uid()
      and om.status = 'active'
      and om.role = 'admin'
  );
$$;

grant execute on function public.is_org_admin(uuid) to authenticated;

-- User profiles
create table public.user_profiles (
  user_id uuid primary key references auth.users (id),
  display_name text,
  phone text,
  mfa_enabled boolean not null default false,
  timezone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Import jobs
create table public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  type public.import_job_type not null,
  status public.import_job_status not null default 'pending',
  file_name text,
  row_count integer,
  error_count integer,
  metadata jsonb,
  error_report_path text,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index import_jobs_org_created_idx on public.import_jobs (organization_id, created_at desc);
create index import_jobs_status_failed_idx on public.import_jobs (status) where status = 'failed';

-- Purchase orders
create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  purchase_order_no text not null,
  status text not null default 'open',
  company text,
  order_value numeric(18,2) not null default 0,
  total_spent numeric(18,2) not null default 0,
  remaining_budget numeric(18,2) not null default 0,
  utilization_percent numeric(5,2) not null default 0,
  order_short_text text,
  vendor_id text,
  vendor_short_term text,
  work_coordinator_name text,
  start_date date,
  completion_date date,
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint purchase_orders_unique_per_org unique (organization_id, purchase_order_no)
);

create index purchase_orders_org_po_idx on public.purchase_orders (organization_id, purchase_order_no);
create index purchase_orders_org_vendor_idx on public.purchase_orders (organization_id, vendor_id);
create index purchase_orders_org_utilization_idx on public.purchase_orders (organization_id, utilization_percent);

-- Quantity surveys
create table public.quantity_surveys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  purchase_order_id uuid references public.purchase_orders (id) on delete set null,
  purchase_order_no text not null,
  qs_number text not null,
  total numeric(18,2) not null default 0,
  quantity_survey_short_text text,
  contractor_contact text,
  vendor_id text,
  created_date date,
  transfer_date date,
  accepted_date date,
  invoice_number text,
  invoice_date date,
  accounting_document text,
  import_job_id uuid references public.import_jobs (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quantity_surveys_unique_per_org unique (organization_id, qs_number)
);

create index quantity_surveys_org_po_idx on public.quantity_surveys (organization_id, purchase_order_no);
create index quantity_surveys_org_created_idx on public.quantity_surveys (organization_id, created_date);

-- Alerts
create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  purchase_order_id uuid not null references public.purchase_orders (id) on delete cascade,
  level public.alert_level not null,
  status public.alert_status not null default 'active',
  utilization_percent numeric(5,2) not null,
  threshold numeric(5,2) not null,
  message text,
  acknowledged_by uuid references auth.users (id),
  acknowledged_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index alerts_org_status_idx on public.alerts (organization_id, status);
create index alerts_org_level_idx on public.alerts (organization_id, level);

-- Audit logs
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  before jsonb,
  after jsonb,
  acted_by uuid references auth.users (id),
  acted_at timestamptz not null default now(),
  context jsonb
);

create index audit_logs_org_idx on public.audit_logs (organization_id, acted_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);

-- Subscriptions (post-production placeholder)
create table public.subscriptions (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  stripe_subscription_id text,
  status text,
  current_period_end timestamptz,
  seats_allocated integer,
  seats_used integer,
  metadata jsonb,
  updated_at timestamptz not null default now()
);

-- RLS policies
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.user_profiles enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.quantity_surveys enable row level security;
alter table public.import_jobs enable row level security;
alter table public.alerts enable row level security;
alter table public.audit_logs enable row level security;
alter table public.subscriptions enable row level security;

-- Organizations policies
create policy "Organizations viewable by members" on public.organizations
  for select using (public.is_org_member(id));

create policy "Organizations updatable by admins" on public.organizations
  for update using (public.is_org_admin(id))
  with check (public.is_org_admin(id));

create policy "Organizations insertable by authenticated" on public.organizations
  for insert with check (auth.uid() = created_by);

-- Organization members policies
create policy "Members can view membership rows" on public.organization_members
  for select using (
    auth.uid() = user_id
    or public.is_org_member(organization_id)
  );

create policy "Members can join themselves" on public.organization_members
  for insert with check (
    auth.uid() = user_id
    or public.is_org_admin(organization_id)
  );

create policy "Members update controlled by admins" on public.organization_members
  for update using (public.is_org_admin(organization_id))
  with check (public.is_org_admin(organization_id));

create policy "Members removable by admins" on public.organization_members
  for delete using (public.is_org_admin(organization_id));

-- User profiles policies
create policy "Users can view own profile" on public.user_profiles
  for select using (auth.uid() = user_id);

create policy "Users can upsert own profile" on public.user_profiles
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Purchase orders policies
create policy "POs viewable by members" on public.purchase_orders
  for select using (public.is_org_member(organization_id));

create policy "POs insertable by members" on public.purchase_orders
  for insert with check (public.is_org_member(organization_id));

create policy "POs updatable by members" on public.purchase_orders
  for update using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "POs deletable by admins" on public.purchase_orders
  for delete using (public.is_org_admin(organization_id));

-- Quantity surveys policies
create policy "QS viewable by members" on public.quantity_surveys
  for select using (public.is_org_member(organization_id));

create policy "QS insertable by members" on public.quantity_surveys
  for insert with check (public.is_org_member(organization_id));

create policy "QS updatable by members" on public.quantity_surveys
  for update using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "QS deletable by admins" on public.quantity_surveys
  for delete using (public.is_org_admin(organization_id));

-- Import jobs policies
create policy "Import jobs viewable by members" on public.import_jobs
  for select using (public.is_org_member(organization_id));

create policy "Import jobs insertable by members" on public.import_jobs
  for insert with check (public.is_org_member(organization_id));

create policy "Import jobs updatable by members" on public.import_jobs
  for update using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- Alerts policies
create policy "Alerts viewable by members" on public.alerts
  for select using (public.is_org_member(organization_id));

create policy "Alerts insertable by members" on public.alerts
  for insert with check (public.is_org_member(organization_id));

create policy "Alerts updatable by members" on public.alerts
  for update using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- Audit logs policies
create policy "Audit logs viewable by members" on public.audit_logs
  for select using (public.is_org_member(organization_id));

create policy "Audit logs insertable by members" on public.audit_logs
  for insert with check (public.is_org_member(organization_id));

-- Subscriptions policies
create policy "Subscriptions viewable by admins" on public.subscriptions
  for select using (public.is_org_admin(organization_id));

create policy "Subscriptions updatable by admins" on public.subscriptions
  for all using (public.is_org_admin(organization_id))
  with check (public.is_org_admin(organization_id));

-- Updated timestamp triggers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  r record;
begin
  for r in select table_name from information_schema.columns where column_name = 'updated_at' and table_schema = 'public'
  loop
    execute format('create trigger %I_set_updated_at before update on %I for each row execute procedure public.set_updated_at()', r.table_name, r.table_name);
  end loop;
end;
$$;
