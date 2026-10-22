-- =====================================================================================
-- Erythmind · persediaan Supabase. Jalankan SEKALI dalam Supabase → SQL Editor → New query → Run.
-- Sebelum Run: tukar GANTI_DENGAN_EMEL_KAU di bawah kepada emel akaun pemilik kau.
-- Selamat dijalankan semula (contohnya untuk menukar emel pemilik).
-- =====================================================================================

-- 1. Satu jadual untuk semua data dunia. Kandungan rekod sudah disulitkan dalam peranti sebelum sampai ke sini.
create table if not exists public.docs (
  path text primary key check (path ~ '^[a-z]+/[A-Za-z0-9_.:-]{1,80}$'),
  coll text generated always as (split_part(path, '/', 1)) stored,
  data jsonb not null,
  by uuid default auth.uid(),
  updated_at timestamptz not null default now()
);
create index if not exists docs_coll_idx on public.docs (coll);

create or replace function public.docs_touch() returns trigger language plpgsql as $$
begin new.updated_at := now(); new.by := auth.uid(); return new; end $$;
drop trigger if exists docs_touch on public.docs;
create trigger docs_touch before insert or update on public.docs for each row execute function public.docs_touch();

-- 2. Tetapan peribadi (tiada akses dari app langsung).
create table if not exists public.settings (k text primary key, v text not null);
alter table public.settings enable row level security;
insert into public.settings (k, v) values ('owner_email', lower('GANTI_DENGAN_EMEL_KAU'))
  on conflict (k) do update set v = excluded.v;

-- 3. Siapa pemilik, siapa disekat, adakah dunia dikunci.
--    Pemilik = akaun emel+kata laluan yang emelnya SUDAH DISAHKAN dan sama dengan owner_email.
create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from auth.users u
    where u.id = auth.uid() and u.email_confirmed_at is not null and coalesce(u.is_anonymous, false) = false
      and lower(u.email) = (select v from public.settings where k = 'owner_email')
  );
$$;
create or replace function public.is_banned() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select (data -> 'banned') ? auth.uid()::text from public.docs where path = 'admin/kawalan'), false);
$$;
create or replace function public.is_locked() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select (data ->> 'locked')::boolean from public.docs where path = 'admin/kawalan'), false);
$$;
create or replace function public.can_enter() returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and (public.is_owner() or (not public.is_banned() and not public.is_locked()));
$$;
grant execute on function public.is_owner(), public.is_banned(), public.is_locked(), public.can_enter() to anon, authenticated;

-- 4. Peraturan baris (Row Level Security).
alter table public.docs enable row level security;
drop policy if exists "baca" on public.docs;
drop policy if exists "tulis tambah" on public.docs;
drop policy if exists "tulis ubah" on public.docs;
drop policy if exists "padam" on public.docs;

-- Baca: status pintu boleh dibaca semua; log masuk, laporan dan risikan hanya pemilik (tetamu nampak baris peranti sendiri sahaja);
-- selebihnya sesiapa yang dibenarkan masuk.
create policy "baca" on public.docs for select to authenticated using (
  path = 'admin/kawalan'
  or (coll in ('laporan', 'risikan', 'masuk') and public.is_owner())
  or path in ('laporan/' || auth.uid(), 'masuk/' || auth.uid())
  or (coll not in ('laporan', 'risikan', 'masuk', 'admin') and public.can_enter())
);
-- Tulis: pemilik boleh semua. Tetamu hanya boleh menulis buku pelawat, laporan dan log masuk milik peranti sendiri, saiz kecil.
create policy "tulis tambah" on public.docs for insert to authenticated with check (
  public.is_owner()
  or (public.can_enter() and path in ('bukutamu/' || auth.uid(), 'laporan/' || auth.uid(), 'masuk/' || auth.uid()) and octet_length(data::text) < 20000)
);
create policy "tulis ubah" on public.docs for update to authenticated using (
  public.is_owner() or path in ('bukutamu/' || auth.uid(), 'laporan/' || auth.uid(), 'masuk/' || auth.uid())
) with check (
  public.is_owner()
  or (public.can_enter() and path in ('bukutamu/' || auth.uid(), 'laporan/' || auth.uid(), 'masuk/' || auth.uid()) and octet_length(data::text) < 20000)
);
create policy "padam" on public.docs for delete to authenticated using (public.is_owner());

-- 5. Perubahan data dihantar serta-merta kepada semua peranti (Realtime).
do $$ begin
  alter publication supabase_realtime add table public.docs;
exception when duplicate_object then null; end $$;

-- 6. Room (borak, suara, kehadiran, kuasa Haki): hanya yang dibenarkan masuk boleh dengar dan bercakap.
drop policy if exists "erythmind room dengar" on realtime.messages;
drop policy if exists "erythmind room hantar" on realtime.messages;
drop policy if exists "erythmind data dengar" on realtime.messages;
create policy "erythmind room dengar" on realtime.messages for select to authenticated
  using (realtime.topic() = 'erythmind' and public.can_enter());
create policy "erythmind room hantar" on realtime.messages for insert to authenticated
  with check (realtime.topic() = 'erythmind' and public.can_enter());

-- Saluran perubahan data: baris yang sampai tetap ditapis oleh peraturan baca di atas.
create policy "erythmind data dengar" on realtime.messages for select to authenticated
  using (realtime.topic() = 'erythmind-docs');

-- Semakan: selepas pemilik mendaftar dan mengesahkan emel, ini patut memaparkan satu baris.
select id, email, email_confirmed_at from auth.users where lower(email) = (select v from public.settings where k = 'owner_email');
