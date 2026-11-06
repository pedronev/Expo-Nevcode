-- =====================================================================
-- NevCode en la expo: interesados capturados por el equipo del stand
-- Ejecuta todo este archivo en Supabase > SQL Editor (una sola vez).
--
-- Seguridad:
--   * La página usa solo la llave publishable (anon). Nunca pongas la
--     service_role en el frontend.
--   * La tabla tiene RLS sin políticas: nadie la lee ni la escribe
--     directo con la llave pública. Tú la ves en el Table Editor.
--   * La página guarda a través de la función submit_expo_lead, que
--     exige el código del equipo. Así nadie ajeno puede llenarte la
--     tabla aunque vea la llave pública en el código de la página.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- 1. Tabla de interesados
-- ---------------------------------------------------------------------
create table if not exists public.expo_leads (
  id              uuid primary key,              -- lo genera el teléfono; evita duplicados al reintentar
  created_at      timestamptz not null default now(),   -- cuándo llegó a la base
  captured_at     timestamptz not null,                 -- cuándo se anotó en el teléfono
  event           text not null default 'expo-nov-2026',
  name            text not null check (char_length(name) between 1 and 120),
  phone           text not null check (char_length(phone) between 10 and 25),
  business        text check (char_length(business) <= 160),
  product         text not null check (product in ('studios', 'assistant', 'ambos', 'no_sabe')),
  interest_level  text not null check (interest_level in ('alto', 'medio', 'bajo')),
  notes           text check (char_length(notes) <= 1000),
  captured_by     text check (char_length(captured_by) <= 60),
  contacted       boolean not null default false,       -- márcalo tú cuando ya le escribiste
  contacted_notes text
);

create index if not exists expo_leads_captured_at_idx on public.expo_leads (captured_at desc);

alter table public.expo_leads enable row level security;
-- Sin políticas a propósito: anon y authenticated no tienen acceso directo.

-- ---------------------------------------------------------------------
-- 2. Código del equipo (se guarda cifrado)
-- ---------------------------------------------------------------------
create table if not exists public.expo_settings (
  key   text primary key,
  value text not null
);

alter table public.expo_settings enable row level security;
-- Sin políticas: nadie la lee con la llave pública.

-- CAMBIA 'pon-aqui-tu-codigo' por el código que les vas a dar a tus ayudantes
-- (por ejemplo una palabra y un número). Si lo quieres cambiar después,
-- vuelve a correr solo este insert con el código nuevo.
insert into public.expo_settings (key, value)
values ('team_code_hash', extensions.crypt('pon-aqui-tu-codigo', extensions.gen_salt('bf')))
on conflict (key) do update set value = excluded.value;

-- ---------------------------------------------------------------------
-- 3. Funciones que llama la página
-- ---------------------------------------------------------------------

-- Revisa si el código del equipo es correcto (la página lo usa al configurarse).
create or replace function public.check_expo_code(p_code text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text;
begin
  select value into v_hash from expo_settings where key = 'team_code_hash';
  return v_hash is not null and p_code is not null and crypt(p_code, v_hash) = v_hash;
end;
$$;

-- Guarda un interesado. Si el mismo registro llega dos veces (reintento), no se duplica.
create or replace function public.submit_expo_lead(p_code text, p_lead jsonb)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not check_expo_code(p_code) then
    raise exception 'codigo_invalido' using errcode = '28000';
  end if;

  insert into expo_leads (
    id, captured_at, name, phone, business, product,
    interest_level, notes, captured_by
  ) values (
    (p_lead ->> 'id')::uuid,
    coalesce((p_lead ->> 'captured_at')::timestamptz, now()),
    btrim(p_lead ->> 'name'),
    btrim(p_lead ->> 'phone'),
    nullif(btrim(coalesce(p_lead ->> 'business', '')), ''),
    p_lead ->> 'product',
    p_lead ->> 'interest_level',
    nullif(btrim(coalesce(p_lead ->> 'notes', '')), ''),
    nullif(btrim(coalesce(p_lead ->> 'captured_by', '')), '')
  )
  on conflict (id) do nothing;

  return 'ok';
end;
$$;

revoke all on function public.check_expo_code(text) from public, anon, authenticated;
revoke all on function public.submit_expo_lead(text, jsonb) from public, anon, authenticated;
grant execute on function public.check_expo_code(text) to anon, authenticated;
grant execute on function public.submit_expo_lead(text, jsonb) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 4. Consultas útiles para ti (no hace falta correrlas ahora)
-- ---------------------------------------------------------------------
-- Todos los interesados, los más recientes primero:
--   select captured_at, name, phone, business, product, interest_level, notes, captured_by, contacted
--   from public.expo_leads order by captured_at desc;
--
-- Primero los que quieren que les escribas pronto:
--   select * from public.expo_leads
--   where not contacted order by (interest_level = 'alto') desc, captured_at;
--
-- Marcar a alguien como contactado:
--   update public.expo_leads set contacted = true, contacted_notes = 'Le escribí el lunes'
--   where id = '...';
