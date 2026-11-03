/* Ekspedisi Buku · Simpanan awan (Supabase).
   Menggunakan projek Supabase yang sama dengan Erythmind (../app/config.js) tetapi kunci sesi berasingan,
   jadi log masuk pemain game tidak menyentuh sesi Erythmind. Jadual: public.eb_simpanan (supabase/ekspedisi-buku.sql).
   Penyegerakan: tarik semua baris akaun → gabung dengan simpanan tempatan → tolak semula. Tolak automatik selepas simpan (ditangguh 4 s). */
(function () {
  const EB = (window.EB = window.EB || {});
  const JADUAL = 'eb_simpanan';
  const A = (EB.awan = {
    sb: null, sesi: null, keadaan: 'mati', ralat: '', akhir: 0, emelMenunggu: '', api: null, tTolak: 0, sibuk: false, perluTolak: false,
    get sedia() { return !!this.sb; },
    get masuk() { return !!this.sesi; },
    get tanpaNama() { return !!(this.sesi && this.sesi.user && this.sesi.user.is_anonymous); },
    get emel() { return (this.sesi && this.sesi.user && this.sesi.user.email) || ''; },

    mula(api) {
      this.api = api;
      const C = window.ERYTH_CONFIG || {};
      if (!window.supabase || !C.supabaseUrl || !C.supabaseKey || /GANTI|xxxx/i.test(C.supabaseUrl)) { this.keadaan = 'mati'; return; }
      try {
        this.sb = window.supabase.createClient(C.supabaseUrl, C.supabaseKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'ekspedisi-buku.auth', flowType: 'implicit' } });
      } catch (e) { this.sb = null; this.keadaan = 'mati'; return; }
      this.keadaan = 'luar';
      this.sb.auth.onAuthStateChange((ev, sesi) => {
        const dulu = this.sesi && this.sesi.user && this.sesi.user.id;
        this.sesi = sesi; this.keadaan = sesi ? 'masuk' : 'luar';
        // panggilan Supabase di luar callback (elak kunci dalaman supabase-js)
        if (sesi && (ev === 'SIGNED_IN' || ev === 'INITIAL_SESSION') && dulu !== sesi.user.id) setTimeout(() => this.segerak(ev === 'SIGNED_IN'), 0);
        setTimeout(() => this.api && this.api.berubah && this.api.berubah(), 0);
      });
      addEventListener('online', () => { if (this.masuk && this.perluTolak) this.tolak(); });
    },
    url() { return location.origin + location.pathname; },

    // --- log masuk ---
    async hantarEmel(emel) {
      emel = String(emel || '').trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emel)) throw new Error('emel');
      const { error } = await this.sb.auth.signInWithOtp({ email: emel, options: { emailRedirectTo: this.url(), shouldCreateUser: true } });
      if (error) throw error;
      this.emelMenunggu = emel;
    },
    async sahkanKod(kod) {
      const token = String(kod || '').replace(/\D/g, '');
      let r = await this.sb.auth.verifyOtp({ email: this.emelMenunggu, token, type: 'email' });
      if (r.error) r = await this.sb.auth.verifyOtp({ email: this.emelMenunggu, token, type: 'signup' });
      if (r.error) throw r.error;
      return r.data;
    },
    async tanpaEmel() { const { error } = await this.sb.auth.signInAnonymously(); if (error) throw error; },
    async keluar() { if (this.perluTolak) await this.tolak().catch(() => {}); await this.sb.auth.signOut(); this.akhir = 0; },

    // --- penyegerakan ---
    tanda() { // dipanggil setiap kali permainan menyimpan
      if (!this.masuk) return;
      this.perluTolak = true;
      clearTimeout(this.tTolak); this.tTolak = setTimeout(() => this.tolak(), 4000);
    },
    async tarik() {
      const { data, error } = await this.sb.from(JADUAL).select('profil_id,nama,warna,data,kemas_kini');
      if (error) throw error;
      return data || [];
    },
    async tolak() {
      if (!this.masuk || !this.api) return;
      if (this.sibuk) { this.perluTolak = true; return; }
      this.sibuk = true;
      try {
        const baris = this.api.senarai().map((p) => ({ user_id: this.sesi.user.id, profil_id: p.id, nama: p.nama, warna: p.warna, data: p.data }));
        if (baris.length) { const { error } = await this.sb.from(JADUAL).upsert(baris, { onConflict: 'user_id,profil_id' }); if (error) throw error; }
        this.perluTolak = false; this.akhir = Date.now(); this.ralat = '';
      } catch (e) { this.ralat = e.message || String(e); this.perluTolak = true; }
      finally { this.sibuk = false; this.api.berubah && this.api.berubah(); }
    },
    async segerak(baru) {
      if (!this.masuk || !this.api) return;
      try {
        const awan = await this.tarik();
        const ubah = this.api.terima(awan);
        await this.tolak();
        if (baru || ubah) this.api.toast && this.api.toast('☁ ' + this.api.L(ubah ? 'Ekspedisi disegerakkan dari awan|Expedition synced from the cloud' : 'Simpanan awan aktif|Cloud save active'));
      } catch (e) { this.ralat = e.message || String(e); this.api.berubah && this.api.berubah(); }
    },
    async padam(profilId) {
      if (!this.masuk) return;
      await this.sb.from(JADUAL).delete().eq('profil_id', profilId).then(() => {}, () => {});
    },
  });

  /* Gabung dua simpanan pemain tanpa kehilangan kemajuan: ambil yang terjauh / tertinggi. */
  EB.gabungSimpanan = function (a, b) {
    a = a || {}; b = b || {};
    const baru = (b.dikemas || 0) > (a.dikemas || 0) ? b : a, lama = baru === a ? b : a;
    const r = JSON.parse(JSON.stringify(baru));
    r.xp = Math.max(a.xp || 0, b.xp || 0);
    r.buku = r.buku || {};
    for (const [id, l] of Object.entries(lama.buku || {})) {
      const n = r.buku[id];
      if (!n) { r.buku[id] = JSON.parse(JSON.stringify(l)); continue; }
      if ((l.depan || 0) > (n.depan || 0)) { n.depan = l.depan; n.pos = l.pos || n.pos; }
      n.bintang = n.bintang || {};
      for (const [k, v] of Object.entries(l.bintang || {})) n.bintang[k] = Math.max(n.bintang[k] || 0, v);
      n.dilihat = n.dilihat || l.dilihat;
    }
    r.ulang = Object.assign({}, lama.ulang || {}, baru.ulang || {});
    const sa = a.siri || {}, sb = b.siri || {};
    r.siri = (sa.hari || '') > (sb.hari || '') ? { ...sa } : (sb.hari || '') > (sa.hari || '') ? { ...sb } : { hari: sa.hari || sb.hari || '', n: Math.max(sa.n || 0, sb.n || 0) };
    r.stat = Object.assign({}, lama.stat || {});
    for (const [k, v] of Object.entries(baru.stat || {})) r.stat[k] = Math.max(r.stat[k] || 0, v);
    r.kebun = r.kebun || {};
    for (const [id, k] of Object.entries(lama.kebun || {})) {
      const n = r.kebun[id];
      if (!n) { r.kebun[id] = JSON.parse(JSON.stringify(k)); continue; }
      n.hari = [...new Set([...(n.hari || []), ...(k.hari || [])])].sort();
      n.buah = n.buah || k.buah;
    }
    r.dikemas = Math.max(a.dikemas || 0, b.dikemas || 0);
    return r;
  };
})();
