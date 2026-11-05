/* Ekspedisi Buku · Enjin audio: muzik latar, bunyi alam, langkah kaki ikut permukaan, dan SFX rakaman sebenar.
   Fail dalam bunyi/ berlesen CC0 kecuali lagu khas buku yang dimuat naik pemilik projek (lihat bunyi/KREDIT.md). */
(function () {
  const EB = (window.EB = window.EB || {});
  const SFX = {
    permata: ['permata-1', 'permata-2'], syiling: ['syiling'], buku: ['buku-1', 'buku-2'], kertas: ['kertas'],
    percik: ['percik-1', 'percik-2'], batu: ['tolak-1', 'tolak-2'], gali: ['gali'], kunci: ['kunci'], pintu: ['pintu'],
    loceng: ['loceng'], pedang: ['pedang'], gong: ['gong'], pop: ['pop'], klik: ['klik'], kayu: ['kayu'], hentak: ['hentak'],
    pasir: ['pasir-L1', 'pasir-R1', 'pasir-L2', 'pasir-R2', 'pasir-L3', 'pasir-R3'],
    batuKaki: ['batu-L1', 'batu-R1', 'batu-L2', 'batu-R2', 'batu-L3', 'batu-R3'],
  };
  const MUZIK = { mula: 'pekan-baharu', jelajah: ['hilir-sungai', 'sari-epal', 'pekan-baharu'],
    // lagu khas buku: bunyi/muzik/<nama>.mp3; jika fail tiada, lagu jelajah biasa dimainkan
    buku: { 'qasas-sabiqin': 'qasas-sabiqin' } };

  const A = (EB.audio = {
    ac: null, induk: null, gSfx: null, gMuzik: null, gAlam: null, penimbal: {}, muat: {}, lagu: null, laguNama: '', alam: null,
    tetapan: { induk: 1, muzik: 0.55, sfx: 0.9, hidup: true },
    // Mesti dipanggil daripada gerak isyarat pengguna (klik/sentuh/kekunci) kerana dasar autoplay browser.
    buka() {
      if (this.ac) { if (this.ac.state === 'suspended') this.ac.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      this.ac = new AC();
      this.induk = this.ac.createGain(); this.induk.connect(this.ac.destination);
      this.gSfx = this.ac.createGain(); this.gSfx.connect(this.induk);
      this.gMuzik = this.ac.createGain(); this.gMuzik.connect(this.induk);
      this.gAlam = this.ac.createGain(); this.gAlam.connect(this.induk);
      this.terap();
      Object.values(SFX).flat().forEach((n) => this.ambil(n));
      if (this.laguTertunda) { const n = this.laguTertunda, g = this.laguGanti; this.laguTertunda = this.laguGanti = null; this.mainLagu(n, g); }
      this.mulaAlam();
    },
    terap(t) {
      if (t) Object.assign(this.tetapan, t);
      if (!this.ac) return;
      const s = this.tetapan, k = this.ac.currentTime;
      this.induk.gain.setTargetAtTime(s.hidup ? s.induk : 0, k, 0.05);
      this.gSfx.gain.setTargetAtTime(s.sfx, k, 0.05);
      this.gMuzik.gain.setTargetAtTime(s.muzik, k, 0.3);
      this.gAlam.gain.setTargetAtTime(s.muzik * 0.6, k, 0.3);
    },
    ambil(nama) {
      if (this.penimbal[nama] || this.muat[nama]) return this.muat[nama];
      this.muat[nama] = fetch('bunyi/sfx/' + nama + '.mp3').then((r) => r.arrayBuffer()).then((b) => new Promise((ok, x) => this.ac.decodeAudioData(b, ok, x)))
        .then((buf) => { this.penimbal[nama] = buf; return buf; }).catch(() => null);
      return this.muat[nama];
    },
    // main(jenis, {vol, kadar, jarak}) — jarak (unit dunia) melemahkan bunyi pemain lain
    main(jenis, o = {}) {
      if (!this.ac || !this.tetapan.hidup) return;
      const senarai = SFX[jenis]; if (!senarai) return;
      const nama = o.indeks !== undefined ? senarai[o.indeks % senarai.length] : senarai[(Math.random() * senarai.length) | 0];
      const buf = this.penimbal[nama]; if (!buf) { this.ambil(nama); return; }
      let vol = o.vol !== undefined ? o.vol : 1;
      if (o.jarak !== undefined) vol *= Math.max(0, 1 - Math.max(0, o.jarak - 2) / 18);
      if (vol <= 0.01) return;
      const src = this.ac.createBufferSource(); src.buffer = buf;
      src.playbackRate.value = (o.kadar || 1) * (0.94 + Math.random() * 0.12);
      const g = this.ac.createGain(); g.gain.value = vol;
      let nod = g;
      if (o.lembut) { const f = this.ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1800; g.connect(f); nod = f; }
      src.connect(g); nod.connect(this.gSfx); src.start();
    },
    // Muzik: elemen <audio> distrim, disambung ke WebAudio, crossfade 2 s
    mainLagu(nama, ganti) {
      if (this.laguNama === nama) return;
      if (!this.ac) { this.laguTertunda = nama; this.laguGanti = ganti; return; }
      this.laguNama = nama;
      const lama = this.lagu;
      const el = new Audio('bunyi/muzik/' + nama + '.mp3'); el.loop = true; el.crossOrigin = 'anonymous'; el.preload = 'auto';
      if (ganti) el.addEventListener('error', () => { if (this.lagu && this.lagu.el === el) { this.lagu = null; this.laguNama = ''; this.mainLagu(ganti); } }, { once: true });
      const src = this.ac.createMediaElementSource(el), g = this.ac.createGain(); g.gain.value = 0;
      src.connect(g); g.connect(this.gMuzik);
      el.play().catch(() => {});
      g.gain.setTargetAtTime(1, this.ac.currentTime, 0.8);
      this.lagu = { el, g };
      if (lama) { lama.g.gain.setTargetAtTime(0, this.ac.currentTime, 0.6); setTimeout(() => { lama.el.pause(); lama.el.src = ''; }, 3500); }
    },
    laguBuku(id) {
      const i = Math.abs([...String(id)].reduce((a, c) => a * 31 + c.charCodeAt(0), 7)) % MUZIK.jelajah.length;
      if (MUZIK.buku[id]) this.mainLagu(MUZIK.buku[id], MUZIK.jelajah[i]); else this.mainLagu(MUZIK.jelajah[i]);
    },
    laguMula() { this.mainLagu(MUZIK.mula); },
    mulaAlam() {
      if (this.alam || !this.ac) return;
      const el = new Audio('bunyi/muzik/hutan-ambien.mp3'); el.loop = true; el.crossOrigin = 'anonymous';
      const src = this.ac.createMediaElementSource(el); src.connect(this.gAlam); el.play().catch(() => {});
      this.alam = el;
    },
    jeda(ya) { // tab tersembunyi: henti muzik supaya tidak bermain di latar
      if (!this.ac) return;
      if (ya) this.ac.suspend(); else this.ac.resume();
    },
  });

  /* ---------- Langkah kaki: setiap separuh kitaran animasi = satu langkah ---------- */
  EB.langkah = {
    kiraan: new WeakMap(),
    // jenisPermukaan(dunia, x, z) → 'pasir' | 'batuKaki', lembut (rumput)
    permukaan(dunia, x, z) {
      const s = dunia.grid.dapat(Math.floor(x), Math.floor(z)), S = EB.SEL;
      const r = Math.floor(z / EB.SUSUN.D), br = dunia.peta && dunia.peta.baris[r], bandar = br && EB.TEMA[br.tema] && EB.TEMA[br.tema].bandar;
      if (s === S.JAMBATAN || s === S.LANTAI || (s === S.JALAN && bandar)) return { jenis: 'batuKaki', lembut: false };
      if (s === S.JALAN) return { jenis: 'pasir', lembut: false };
      return { jenis: 'pasir', lembut: true };
    },
    kemas(model, laju, dunia, x, z, jarak) {
      if (laju < 0.6) return;
      const u = model.userData, n = Math.floor(u.fasa / Math.PI);
      const dulu = this.kiraan.get(model);
      this.kiraan.set(model, n);
      if (dulu === undefined || dulu === n) return;
      const p = this.permukaan(dunia, x, z), lari = laju > 4;
      A.main(p.jenis, { indeks: n, vol: (lari ? 0.75 : 0.45) * (p.lembut ? 0.8 : 1), kadar: lari ? 1.12 : 1, lembut: p.lembut, jarak });
    },
  };
})();
