-- Ekspedisi Buku · dunia bersama (kehadiran pemain, kedudukan, chat teks, isyarat chat suara).
-- Jalankan sekali dalam Supabase: SQL Editor → New query → tampal fail ini → Run.
-- Hanya menambah dua peraturan Realtime untuk saluran bernama "eb:<idBuku>". Peraturan Erythmind tidak diubah.
-- Mesej Realtime tidak disimpan dalam pangkalan data; peraturan ini hanya menentukan siapa boleh mendengar dan menghantar.

drop policy if exists "eb dunia dengar" on realtime.messages;
drop policy if exists "eb dunia hantar" on realtime.messages;

-- Sesiapa yang log masuk (emel atau tanpa nama) boleh mendengar dan menghantar dalam saluran dunia buku.
create policy "eb dunia dengar" on realtime.messages for select to authenticated
  using (realtime.topic() like 'eb:%' and realtime.messages.extension in ('broadcast', 'presence'));
create policy "eb dunia hantar" on realtime.messages for insert to authenticated
  with check (realtime.topic() like 'eb:%' and realtime.messages.extension in ('broadcast', 'presence'));

-- Semakan: patut memaparkan dua baris.
select policyname from pg_policies where schemaname = 'realtime' and policyname like 'eb dunia%';
