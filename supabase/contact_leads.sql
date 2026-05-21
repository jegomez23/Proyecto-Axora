create extension if not exists pgcrypto;

create table if not exists public.contact_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre text not null check (char_length(nombre) between 2 and 80),
  email text not null check (char_length(email) between 5 and 120),
  negocio text not null check (char_length(negocio) between 2 and 100),
  mensaje text not null check (char_length(mensaje) between 10 and 1200),
  consentimiento boolean not null default false,
  status text not null default 'nuevo' check (status in ('nuevo', 'en_revision', 'cerrado')),
  source text not null default 'web_axora',
  ip_address text,
  user_agent text check (user_agent is null or char_length(user_agent) <= 512),
  notes text
);

create index if not exists contact_leads_created_at_idx
on public.contact_leads(created_at desc);

create index if not exists contact_leads_email_idx
on public.contact_leads(email);

create index if not exists contact_leads_status_idx
on public.contact_leads(status);

alter table public.contact_leads enable row level security;

grant usage on schema public to anon, authenticated;
revoke all on table public.contact_leads from anon;
grant insert (
  nombre,
  email,
  negocio,
  mensaje,
  consentimiento,
  source,
  ip_address,
  user_agent
) on table public.contact_leads to anon;

drop policy if exists "public_can_insert_contact_leads" on public.contact_leads;
drop policy if exists "no_public_select" on public.contact_leads;
drop policy if exists "no_public_update" on public.contact_leads;
drop policy if exists "no_public_delete" on public.contact_leads;
drop policy if exists "authenticated_users_can_read" on public.contact_leads;
drop policy if exists "authenticated_users_can_update" on public.contact_leads;
drop policy if exists "authenticated_users_can_delete" on public.contact_leads;

create policy "public_can_insert_contact_leads"
on public.contact_leads
for insert
to anon
with check (
  consentimiento = true
  and source = 'web_axora'
  and char_length(nombre) between 2 and 80
  and char_length(email) between 5 and 120
  and char_length(negocio) between 2 and 100
  and char_length(mensaje) between 10 and 1200
  and status = 'nuevo'
);

create policy "no_public_select"
on public.contact_leads
for select
to anon
using (false);

create policy "no_public_update"
on public.contact_leads
for update
to anon
using (false)
with check (false);

create policy "no_public_delete"
on public.contact_leads
for delete
to anon
using (false);

create policy "authenticated_users_can_read"
on public.contact_leads
for select
to authenticated
using (true);

create policy "authenticated_users_can_update"
on public.contact_leads
for update
to authenticated
using (true)
with check (true);

create policy "authenticated_users_can_delete"
on public.contact_leads
for delete
to authenticated
using (true);
