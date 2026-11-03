/* Ekspedisi Buku · Dunia bersama: pemain lain dalam buku yang sama, chat teks dan chat suara.
   Pengangkutan: Supabase Realtime (saluran peribadi "eb:<idBuku>", lihat supabase/ekspedisi-buku-dunia.sql).
   Suara: WebRTC rakan-ke-rakan, isyarat melalui saluran yang sama. Kelantangan ikut jarak di dalam dunia. */
(function () {
  const EB = (window.EB = window.EB || {});
  const T = THREE;
  const ICE = [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }];
  const MAKS_SUARA = 8, JARAK_DENGAR = 24;
  const KASAR = ['babi', 'bodoh', 'sial', 'celaka', 'pukimak', 'puki', 'lancau', 'bangsat', 'anjing', 'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'kontol', 'pantat'];
  const tapis = (s) => { let t = String(s).slice(0, 200); for (const k of KASAR) t = t.replace(new RegExp('\\b' + k + '\\b', 'gi'), (m) => m[0] + '*'.repeat(m.length - 1)); return t; };
  const tabId = Math.random().toString(36).slice(2, 8);

  const B = (EB.bersama = {
    api: null, saluran: null, buku: null, saya: null, keadaan: 'luar', lain: new Map(), sejarah: [], senyap: new Set(),
    tHantar: 0, akhirHantar: null, tChat: 0, mic: null, micHidup: false, suaraAktif: false, pc: new Map(),

    mula(api) {
      this.api = api;
      try { this.senyap = new Set(JSON.parse(localStorage.getItem('ekspedisi-buku.senyap') || '[]')); } catch (e) { /* abaikan */ }
    },
    get boleh() { return !!(EB.awan && EB.awan.sedia); },

    async masuk(buku) {
      if (!this.boleh || !this.api.dalamTalian()) return;
      if (this.saluran && this.buku === buku.id) return;
      await this.keluar();
      this.buku = buku.id; this.keadaan = 'menyambung'; this.api.berubah();
      const A = EB.awan;
      try { if (!A.masuk) await A.tanpaEmel(); } catch (e) { this.keadaan = 'ralat'; this.ralat = e.message; this.api.berubah(); return; }
      const uid = A.sesi && A.sesi.user && A.sesi.user.id; if (!uid || this.buku !== buku.id) return;
      this.saya = uid + ':' + tabId;
      await A.sb.realtime.setAuth(A.sesi.access_token);
      const ch = (this.saluran = A.sb.channel('eb:' + buku.id, { config: { private: true, presence: { key: this.saya }, broadcast: { self: false } } }));
      ch.on('presence', { event: 'sync' }, () => this.selaras());
      ch.on('broadcast', { event: 'pos' }, ({ payload }) => this.terimaPos(payload));
      ch.on('broadcast', { event: 'chat' }, ({ payload }) => this.terimaChat(payload));
      ch.on('broadcast', { event: 'rtc' }, ({ payload }) => this.terimaRtc(payload));
      ch.subscribe(async (st, err) => {
        if (st === 'SUBSCRIBED') { this.keadaan = 'masuk'; this.ralat = ''; await this.jejak(); this.hantarPos(true); }
        else if (st === 'CHANNEL_ERROR' || st === 'TIMED_OUT') { this.keadaan = 'ralat'; this.ralat = (err && err.message) || st; }
        else if (st === 'CLOSED') this.keadaan = 'luar';
        this.api.berubah();
      });
    },
    async keluar() {
      this.tutupSuara();
      for (const o of this.lain.values()) this.buangAvatar(o);
      this.lain.clear();
      if (this.buihSaya) { this.api.buangLabel(this.buihSaya); this.buihSaya = null; }
      if (this.saluran) { const ch = this.saluran; this.saluran = null; try { await ch.untrack(); } catch (e) { /* abaikan */ } try { await EB.awan.sb.removeChannel(ch); } catch (e) { /* abaikan */ } }
      this.keadaan = 'luar'; this.buku = null; this.api && this.api.berubah();
    },
    async jejak() {
      if (!this.saluran || this.keadaan !== 'masuk') return;
      const pr = this.api.profil() || {};
      await this.saluran.track({ nama: String(pr.nama || 'Pengembara').slice(0, 20), warna: pr.warna || '#2e86c1', suara: this.suaraAktif, t: Date.now() });
    },

    /* ---------- kehadiran ---------- */
    selaras() {
      const st = this.saluran.presenceState(), ada = new Set();
      for (const [kunci, metas] of Object.entries(st)) {
        if (kunci === this.saya) continue;
        const m = metas[metas.length - 1]; ada.add(kunci);
        let o = this.lain.get(kunci);
        if (!o) { o = this.ciptaAvatar(kunci, m); this.lain.set(kunci, o); this.api.toast('👋 ' + m.nama + ' ' + this.api.L('masuk ke dunia ini|joined this world')); EB.audio && EB.audio.main('pop', { vol: 0.5 }); }
        if (o.nama !== m.nama || o.warna !== m.warna) { o.nama = m.nama; o.warna = m.warna; o.lbl.e.querySelector('b').textContent = m.nama; const mt = EB.mat(m.warna); o.model.userData.torso.material = mt; o.model.userData.tangan.forEach((g) => (g.children[0].material = mt)); }
        o.suara = !!m.suara; o.lbl.e.querySelector('i').textContent = o.suara ? '🎙' : '';
      }
      for (const [k, o] of this.lain) if (!ada.has(k)) { this.buangAvatar(o); this.lain.delete(k); this.tutupPc(k); }
      this.rangkaiSuara();
      this.api.berubah();
    },
    ciptaAvatar(kunci, m) {
      const d = this.api.dunia();
      const model = EB.binaWatak({ baju: m.warna || '#2e86c1', seluar: '#3b3f5c', topi: 'pengembara', beg: true });
      model.visible = false; d.scene.add(model);
      const lbl = this.api.tambahLabel(new T.Vector3(0, -99, 0), 'nama-lain', `<span><i></i><b>${this.api.esc(m.nama)}</b></span>`);
      return { kunci, nama: m.nama, warna: m.warna, model, lbl, pos: new T.Vector2(), sasar: null, vel: new T.Vector2(), yaw: 0, laju: 0, tTerima: 0, buih: null };
    },
    buangAvatar(o) { const d = this.api.dunia(); d.scene.remove(o.model); this.api.buangLabel(o.lbl); if (o.buih) this.api.buangLabel(o.buih); if (o.audio) { o.audio.srcObject = null; o.audio.remove(); } },

    /* ---------- kedudukan ---------- */
    hantarPos(paksa) {
      if (!this.saluran || this.keadaan !== 'masuk') return;
      const p = this.api.pemain(); if (!p) return;
      const s = { x: +p.pos.x.toFixed(2), z: +p.pos.y.toFixed(2), vx: +p.vel.x.toFixed(2), vz: +p.vel.y.toFixed(2), y: +p.yaw.toFixed(2) };
      const a = this.akhirHantar, bergerak = p.laju > 0.15;
      if (!paksa && a && !bergerak && Math.hypot(a.x - s.x, a.z - s.z) < 0.05 && Math.abs(a.vx) + Math.abs(a.vz) < 0.05) return;
      this.akhirHantar = s;
      this.saluran.send({ type: 'broadcast', event: 'pos', payload: { i: this.saya, ...s } });
    },
    terimaPos(q) {
      const o = this.lain.get(q.i); if (!o) return;
      if (!o.sasar) { o.pos.set(q.x, q.z); o.model.visible = true; }
      o.sasar = { x: q.x, z: q.z }; o.vel.set(q.vx, q.vz); o.yawS = q.y; o.tTerima = 0;
    },
    kemas(dt, tm) {
      if (!this.saluran) return;
      this.tHantar += dt; this.tSelalu = (this.tSelalu || 0) + dt;
      const p = this.api.pemain();
      if (p && this.tHantar > (p.laju > 0.15 ? 0.28 : 1)) { this.tHantar = 0; const paksa = this.tSelalu > 6; if (paksa) this.tSelalu = 0; this.hantarPos(paksa); }
      if (p && this.buihSaya) this.buihSaya.pos.set(p.pos.x, 2.05, p.pos.y);
      const d = this.api.dunia();
      for (const o of this.lain.values()) {
        if (!o.sasar) continue;
        o.tTerima += dt;
        // ramalan ke hadapan ikut halaju (sehingga 0.5 s), kemudian kejar sasaran secara licin
        const ram = Math.min(o.tTerima, 0.5), tx = o.sasar.x + o.vel.x * ram, tz = o.sasar.z + o.vel.y * ram;
        const k = 1 - Math.pow(0.0005, dt);
        const nx = o.pos.x + (tx - o.pos.x) * k, nz = o.pos.y + (tz - o.pos.y) * k;
        const v = Math.hypot(nx - o.pos.x, nz - o.pos.y) / Math.max(dt, 1e-3);
        o.pos.set(nx, nz); o.laju += (Math.min(v, 6) - o.laju) * Math.min(1, dt * 8);
        if (o.laju > 0.2) { let b = Math.atan2(o.vel.x || nx - o.pos.x, o.vel.y || nz - o.pos.y) - o.yaw; while (b > Math.PI) b -= Math.PI * 2; while (b < -Math.PI) b += Math.PI * 2; o.yaw += b * Math.min(1, dt * 10); }
        else if (o.yawS !== undefined) o.yaw += (o.yawS - o.yaw) * Math.min(1, dt * 4);
        o.model.position.set(o.pos.x, 0, o.pos.y); o.model.rotation.y = o.yaw;
        EB.animasiWatak(o.model, o.laju, dt, tm, 0);
        o.lbl.pos.set(o.pos.x, 1.55, o.pos.y); if (o.buih) o.buih.pos.set(o.pos.x, 2.05, o.pos.y);
        const jauh = p ? Math.hypot(o.pos.x - p.pos.x, o.pos.y - p.pos.y) : 99; o.jarak = jauh;
        if (EB.langkah) EB.langkah.kemas(o.model, o.laju, d, o.pos.x, o.pos.y, jauh);
        if (o.audio) o.audio.volume = this.senyap.has(o.kunci) ? 0 : Math.max(0, Math.min(1, 1 - (jauh - 3) / (JARAK_DENGAR - 3)));
      }
      if (this.analis) this.kemasMeter();
    },

    /* ---------- chat teks ---------- */
    hantarChat(teks) {
      teks = tapis(String(teks || '').trim()); if (!teks || !this.saluran || this.keadaan !== 'masuk') return false;
      const kini = Date.now(); if (kini - this.tChat < 1200) { this.api.toast(this.api.L('Perlahan sedikit…|Slow down a little…')); return false; }
      this.tChat = kini;
      const pr = this.api.profil() || {};
      const m = { i: this.saya, nama: pr.nama || 'Pengembara', warna: pr.warna || '#2e86c1', teks, t: kini };
      this.saluran.send({ type: 'broadcast', event: 'chat', payload: m });
      this.simpanChat(m, true); this.tunjukBuih(null, teks);
      return true;
    },
    terimaChat(m) {
      if (!m || this.senyap.has(m.i)) return;
      m.teks = tapis(m.teks); this.simpanChat(m, false);
      const o = this.lain.get(m.i); if (o) this.tunjukBuih(o, m.teks);
      EB.audio && EB.audio.main('pop', { vol: 0.6 });
    },
    simpanChat(m, sendiri) { this.sejarah.push({ ...m, sendiri }); if (this.sejarah.length > 60) this.sejarah.shift(); this.api.chatBaru(m, sendiri); },
    tunjukBuih(o, teks) {
      const p = this.api.pemain(), x = o ? o.pos.x : p.pos.x, z = o ? o.pos.y : p.pos.y, k = o ? 'buih' : 'buihSaya', milik = o || this;
      if (milik[k]) this.api.buangLabel(milik[k]);
      const b = (milik[k] = this.api.tambahLabel(new T.Vector3(x, 2.05, z), 'buih', `<span>${this.api.esc(teks)}</span>`));
      setTimeout(() => { if (milik[k] === b) { this.api.buangLabel(b); milik[k] = null; } }, 6000);
    },

    togolSenyap(kunci) {
      if (this.senyap.has(kunci)) this.senyap.delete(kunci); else this.senyap.add(kunci);
      try { localStorage.setItem('ekspedisi-buku.senyap', JSON.stringify([...this.senyap])); } catch (e) { /* abaikan */ }
    },

    /* ---------- suara (WebRTC) ---------- */
    async sertaiSuara() {
      if (this.suaraAktif) return;
      try {
        this.mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      } catch (e) { this.api.toast('🎙 ' + this.api.L('Akses mikrofon ditolak atau tiada mikrofon.|Microphone access denied or no microphone.')); return; }
      this.suaraAktif = true; this.micHidup = true;
      try {
        const ac = EB.audio && EB.audio.ac;
        if (ac) { this.analis = ac.createAnalyser(); this.analis.fftSize = 256; ac.createMediaStreamSource(this.mic).connect(this.analis); this.dataMeter = new Uint8Array(this.analis.frequencyBinCount); }
      } catch (e) { this.analis = null; }
      await this.jejak(); this.rangkaiSuara(); this.api.berubah();
    },
    togolMic() { if (!this.mic) return; this.micHidup = !this.micHidup; this.mic.getAudioTracks().forEach((t) => (t.enabled = this.micHidup)); this.api.berubah(); },
    tutupSuara() {
      for (const k of [...this.pc.keys()]) this.tutupPc(k);
      if (this.mic) this.mic.getTracks().forEach((t) => t.stop());
      this.mic = null; this.suaraAktif = false; this.micHidup = false; this.analis = null;
    },
    async keluarSuara() { this.tutupSuara(); await this.jejak(); this.api.berubah(); },
    kemasMeter() { if (!this.analis || !this.micHidup) { this.aras = 0; return; } this.analis.getByteTimeDomainData(this.dataMeter); let m = 0; for (const v of this.dataMeter) m = Math.max(m, Math.abs(v - 128)); this.aras = m / 128; },
    rangkaiSuara() {
      if (!this.suaraAktif) return;
      const calon = [...this.lain.values()].filter((o) => o.suara).sort((a, b) => (a.jarak || 0) - (b.jarak || 0)).slice(0, MAKS_SUARA);
      const mahu = new Set(calon.map((o) => o.kunci));
      for (const k of [...this.pc.keys()]) if (!mahu.has(k)) this.tutupPc(k);
      for (const o of calon) if (!this.pc.has(o.kunci) && this.saya < o.kunci) this.mulaPc(o.kunci, true);
    },
    pcBaru(kunci) {
      const pc = new RTCPeerConnection({ iceServers: ICE });
      this.mic.getTracks().forEach((t) => pc.addTrack(t, this.mic));
      pc.onicecandidate = (e) => { if (e.candidate) this.isyarat(kunci, 'ice', e.candidate.toJSON()); };
      pc.ontrack = (e) => {
        const o = this.lain.get(kunci); if (!o) return;
        if (!o.audio) { o.audio = document.createElement('audio'); o.audio.autoplay = true; o.audio.playsInline = true; document.body.appendChild(o.audio); }
        o.audio.srcObject = e.streams[0]; o.audio.play().catch(() => {});
      };
      pc.onconnectionstatechange = () => { if (['failed', 'closed'].includes(pc.connectionState)) this.tutupPc(kunci); };
      this.pc.set(kunci, pc);
      return pc;
    },
    async mulaPc(kunci) {
      const pc = this.pcBaru(kunci);
      const tawaran = await pc.createOffer(); await pc.setLocalDescription(tawaran);
      this.isyarat(kunci, 'tawaran', pc.localDescription.toJSON());
    },
    tutupPc(kunci) { const pc = this.pc.get(kunci); if (pc) { try { pc.close(); } catch (e) { /* abaikan */ } this.pc.delete(kunci); } const o = this.lain.get(kunci); if (o && o.audio) { o.audio.srcObject = null; } },
    isyarat(ke, jenis, data) { if (this.saluran) this.saluran.send({ type: 'broadcast', event: 'rtc', payload: { dari: this.saya, ke, jenis, data } }); },
    async terimaRtc(m) {
      if (!m || m.ke !== this.saya || !this.suaraAktif) return;
      try {
        if (m.jenis === 'tawaran') {
          const pc = this.pc.get(m.dari) || this.pcBaru(m.dari);
          await pc.setRemoteDescription(m.data);
          const j = await pc.createAnswer(); await pc.setLocalDescription(j);
          this.isyarat(m.dari, 'jawapan', pc.localDescription.toJSON());
        } else if (m.jenis === 'jawapan') { const pc = this.pc.get(m.dari); if (pc) await pc.setRemoteDescription(m.data); }
        else if (m.jenis === 'ice') { const pc = this.pc.get(m.dari); if (pc) await pc.addIceCandidate(m.data); }
      } catch (e) { /* isyarat lewat atau tidak sepadan: abaikan, sambungan akan dicuba semula */ }
    },

    senaraiPemain() { return [...this.lain.values()].map((o) => ({ kunci: o.kunci, nama: o.nama, warna: o.warna, suara: o.suara, jarak: o.jarak, senyap: this.senyap.has(o.kunci), pos: { x: o.pos.x, z: o.pos.y }, sambung: !!this.pc.get(o.kunci) })); },
  });
  EB.tapisChat = tapis;
})();
