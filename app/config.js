/* Erythmind app · sambungan ke projek Supabase kau.
   Isi dua nilai ini dari Supabase: Project Settings → API (atau Data API).
   - supabaseUrl : "Project URL", contoh https://abcdxyz.supabase.co
   - supabaseKey : kunci "anon" / "publishable". Kunci ini memang awam; keselamatan datang daripada
                   peraturan dalam supabase/setup.sql dan penyulitan PIN dalam peranti.
   JANGAN letak kunci "service_role" / "secret" di sini. */
window.ERYTH_CONFIG = {
  supabaseUrl: 'GANTI_DENGAN_PROJECT_URL',
  supabaseKey: 'GANTI_DENGAN_ANON_KEY',
};
