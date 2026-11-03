-- Ekspedisi Buku · simpanan awan pemain.
-- Jalankan sekali dalam Supabase: SQL Editor → New query → tampal fail ini → Run.
-- Selamat dijalankan berulang kali. Tidak mengubah jadual atau peraturan Erythmind.

-- 1. Satu baris = satu pemain (profil) milik satu akaun. Satu akaun boleh ada beberapa pemain (contohnya satu keluarga, satu peranti).
create table if not exists public.eb_simpanan (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  profil_id  text not null check (char_length(profil_id) between 1 and 40),
  nama       text not null check (char_length(nama) between 1 and 20),
  warna      text not null default '#2e86c1' check (warna ~ '^#[0-9a-fA-F]{6}$'),
  data       jsonb not null,
  kemas_kini timestamptz not null default now(),
  primary key (user_id, profil_id)
);

create or replace function public.eb_simpanan_sentuh() returns trigger language plpgsql as $$
begin new.kemas_kini := now(); return new; end $$;
drop trigger if exists eb_simpanan_sentuh on public.eb_simpanan;
create trigger eb_simpanan_sentuh before insert or update on public.eb_simpanan for each row execute function public.eb_simpanan_sentuh();

-- 2. Setiap akaun hanya nampak dan mengubah baris sendiri. Saiz data dihadkan supaya pangkalan data tidak disalahgunakan.
alter table public.eb_simpanan enable row level security;
drop policy if exists "eb baca sendiri" on public.eb_simpanan;
drop policy if exists "eb tambah sendiri" on public.eb_simpanan;
drop policy if exists "eb ubah sendiri" on public.eb_simpanan;
drop policy if exists "eb padam sendiri" on public.eb_simpanan;
create policy "eb baca sendiri" on public.eb_simpanan for select to authenticated using (user_id = auth.uid());
create policy "eb tambah sendiri" on public.eb_simpanan for insert to authenticated
  with check (user_id = auth.uid() and octet_length(data::text) < 200000);
create policy "eb ubah sendiri" on public.eb_simpanan for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid() and octet_length(data::text) < 200000);
create policy "eb padam sendiri" on public.eb_simpanan for delete to authenticated using (user_id = auth.uid());

revoke all on public.eb_simpanan from anon;
grant select, insert, update, delete on public.eb_simpanan to authenticated;

-- 3. Had bilangan pemain setiap akaun (elak penyalahgunaan).
create or replace function public.eb_had_profil() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.eb_simpanan where user_id = new.user_id) >= 12 then
    raise exception 'Had 12 pemain setiap akaun';
  end if;
  return new;
end $$;
drop trigger if exists eb_had_profil on public.eb_simpanan;
create trigger eb_had_profil before insert on public.eb_simpanan for each row execute function public.eb_had_profil();

-- Semakan: jadual wujud dan RLS hidup (patut memaparkan eb_simpanan | true).
select relname, relrowsecurity from pg_class where relname = 'eb_simpanan';
