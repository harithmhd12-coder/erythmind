/* Ujian asap Ruang Ilmu. Jalankan sambil menghidangkan repo ini:
   python3 -m http.server 8000 --bind 127.0.0.1 &  node tests/ruang-ilmu-smoke.cjs
   TEST_ORIGIN boleh ditetapkan kepada URL sebenar selepas deploy. */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const origin = (process.env.TEST_ORIGIN || 'http://127.0.0.1:8000') + '/ruang-ilmu/';
const shots = process.env.SHOTS || '';

(async () => {
  const browser = await chromium.launch();
  for (const [nama, viewport] of [['tel', { width: 400, height: 860 }], ['desk', { width: 1366, height: 900 }]]) {
    const ctx = await browser.newContext({ serviceWorkers: 'block', timezoneId: 'Asia/Kuala_Lumpur', viewport });
    if (!process.env.FONTS) await ctx.route('https://fonts.googleapis.com/**', r => r.abort());
    await ctx.addInitScript(() => {
      window.__ucapan = [];
      window.SpeechSynthesisUtterance = function (t) { this.text = t; };
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { speak(u) { window.__ucapan.push(u.text); setTimeout(() => u.onend && u.onend(), 5); }, cancel() {}, getVoices() { return []; }, addEventListener() {} } });
    });
    const page = await ctx.newPage(); const errors = [];
    // Jam ditetapkan selepas episod terakhir kelompok pertama (26 Nov 2026) supaya semua episod kelihatan.
    await page.clock.setFixedTime(new Date('2026-11-27T09:00:00+08:00'));
    page.on('pageerror', e => errors.push(e.message));
    const buka = async h => { await page.goto(origin + '#' + h); await page.waitForTimeout(250); };
    const tiadaLimpahan = async h => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0, `Limpahan mendatar pada ${h} (${nama})`);
    const shot = async n => { if (shots) await page.screenshot({ path: `${shots}/${nama}-${n}.png`, fullPage: true }); };

    // Siri: indeks
    await buka('siri');
    assert.equal(await page.locator('.siri-kad').count(), 6, 'Enam kad siri');
    assert.match(await page.locator('.kosong-siri').innerText(), /Akan datang[\s\S]*Sip n Speak/i);
    assert.equal(await page.locator('.kosong-siri a, a.kosong-siri').count(), 0, 'Sip n Speak tidak boleh dibuka');
    assert.equal(await page.locator('[data-nav="siri"][aria-current="page"]').count(), 1);
    await tiadaLimpahan('siri'); await shot('siri');
    for (const h of ['s.constructor', 's.__proto__', 'e.constructor']) { await buka(h); assert.match(await page.locator('h1').innerText(), /tiada di rak/, `Laluan ${h} ditolak`); }
    await buka('s.sip-n-speak');
    assert.match(await page.locator('h1').innerText(), /tiada di rak/, 'Siri akan datang tiada halaman');

    // Episod soal-jawab (arah A: semua soalan terbuka)
    await buka('e.benci-kepada-kebenaran');
    assert.match(await page.locator('h1').innerText(), /Benci kepada Kebenaran/);
    assert.equal(await page.locator('.soalan-ep').count(), 2, 'Dua soalan dipaparkan');
    assert.ok(await page.locator('.ayat .ar').count() >= 5, 'Ayat dipaparkan');
    assert.equal(await page.locator('.ayat .ar').first().getAttribute('dir'), 'rtl');
    assert.match(await page.locator('.ayat .ruj').first().innerText(), /Surah al-Mukminun, ayat 68/);
    const teks = await page.locator('#kandungan').innerText();
    for (const larang of [/Assalamualaikum Subuh/i, /PANEL/, /USTAZ BAKHTIAR/i, /MUSIL/, /Al-?Bayan/i, /drive\.google/i, /QR/]) assert.doesNotMatch(teks, larang, `Teks terlarang: ${larang}`);
    assert.equal(await page.locator('[data-nav="siri"][aria-current="page"]').count(), 1, 'Nav Siri aktif di episod');
    await tiadaLimpahan('episod'); await shot('episod');
    await page.click('[data-act="selesai"][data-slug="benci-kepada-kebenaran"]');
    await buka('s.tadabbur-al-mukminun');
    assert.match(await page.locator('.halaman-kepala').innerText(), /1 daripada 15 selesai/, 'Kemajuan siri dikemas kini');
    await buka('siri');
    assert.match(await page.locator('.siri-kad').first().innerText(), /1\/15 selesai/);

    // Setiap episod siri soal-jawab dibuka bersih (Tugasan 3 dan 4)
    const episod = await page.evaluate(() => SIRI.filter(s => s.jenis === 'soal-jawab').flatMap(s => s.episod));
    assert.ok(episod.length >= 19, `Sekurang-kurangnya 19 episod (dapat ${episod.length})`);
    for (const slug of episod) {
      await buka('e.' + slug);
      assert.ok(await page.locator('.soalan-ep').count() >= 1, `Episod ${slug} ada soalan`);
      const t = await page.locator('#kandungan').innerText();
      for (const larang of [/Assalamualaikum (Subuh|Dhuha)/i, /\bPANEL\b/, /BAKHTIAR/i, /PU AMIN/i, /DAI (FUAD|HAKIM)/i, /MUSIL/, /Al-?Bayan/i, /drive\.google/i, /\bPOSTER\b/i, /Durasi/i]) assert.doesNotMatch(t, larang, `Teks terlarang ${larang} dalam ${slug}`);
      assert.equal(await page.locator('.ayat .ruj, .ayat .tiada-ruj').count(), await page.locator('.ayat').count(), `Setiap blok ayat/hadis dalam ${slug} ada rujukan atau label`);
    }
    await buka('siri');
    assert.match(await page.locator('.siri-kad').first().innerText(), /15 episod/i);
    assert.match(await page.locator('.siri-kad').nth(1).innerText(), /4 episod/i);
    await buka('e.sifat-malu');
    assert.ok(await page.locator('.tiada-ruj').count() >= 1, 'Hadis tanpa rujukan dilabel');
    assert.match(await page.locator('.tiada-ruj').first().innerText(), /Rujukan belum dinyatakan/i);

    // Kenali Munafik: senarai semak muhasabah (Tugasan 6)
    await buka('s.kenali-munafik');
    const kotak = page.locator('input[data-semak="kenali-munafik"]');
    const jumlahSemak = await kotak.count();
    assert.ok(jumlahSemak >= 12, `Item muhasabah dipaparkan (${jumlahSemak})`);
    assert.match(await page.locator('.nota-privasi').innerText(), /Untuk muhasabah diri, bukan untuk menilai orang lain\. Tanda kau disimpan dalam peranti ini sahaja\./);
    assert.equal(await page.locator('.item-muhasabah .ayat .ruj').count(), await page.locator('.item-muhasabah .ayat').count(), 'Setiap dalil ada rujukan');
    assert.equal(await page.locator('.item-muhasabah .tiada-ruj').count(), 0, 'Tiada dalil tanpa rujukan');
    assert.doesNotMatch(await page.locator('#kandungan').innerText(), /Freemason|Rotary|Lions|Protokol|Protocols/i, 'Bahagian sejarah dan pertubuhan tidak dimasukkan');
    await tiadaLimpahan('semak'); await shot('semak');
    const permintaan = []; const catatMinta = r => permintaan.push(r.url());
    page.on('request', catatMinta);
    await kotak.nth(0).check(); await kotak.nth(3).check();
    await page.waitForTimeout(200);
    page.off('request', catatMinta);
    assert.deepEqual(permintaan, [], 'Menanda tidak menghantar apa-apa permintaan rangkaian');
    assert.match(await page.locator('#kemajuanSiri').innerText(), new RegExp(`2 daripada ${jumlahSemak} sudah direnung`));
    assert.equal(await page.evaluate(() => document.activeElement?.dataset?.k), '0-3', 'Fokus kekal pada kotak yang ditanda');
    await page.reload(); await page.waitForTimeout(250);
    assert.ok(await kotak.nth(0).isChecked() && await kotak.nth(3).isChecked() && !(await kotak.nth(1).isChecked()), 'Tanda kekal selepas muat semula');
    assert.equal(await page.locator('.item-muhasabah.direnung').count(), 2);
    await buka('siri');
    assert.match(await page.locator('.siri-kad').nth(2).innerText(), new RegExp(`2/${jumlahSemak} selesai`));
    await buka('s.kenali-munafik');
    for (let i = 0; i < jumlahSemak; i++) if (!(await kotak.nth(i).isChecked())) await kotak.nth(i).check();
    assert.match(await page.locator('#statusSemak').innerText(), /Muhasabah lengkap/);
    assert.equal(await page.evaluate(() => !!JSON.parse(localStorage.getItem('ruangilmu.v1')).selesai['s-kenali-munafik']), true, 'Muhasabah lengkap ditanda selesai');
    await page.click('[data-act="semak-kosong"]');
    assert.equal(await page.locator('input[data-semak]:checked').count(), 0, 'Kosongkan tanda');
    await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('ruangilmu.v1')); s.semak = { 'kenali-munafik': { '0-0': '2026-11-01', '<img>': 'x', '0-1': 5 }, palsu: { '0-0': 'x' } }; localStorage.setItem('ruangilmu.v1', JSON.stringify(s)); });
    await page.reload(); await page.waitForTimeout(250);
    assert.equal(await page.locator('input[data-semak]:checked').count(), 1, 'Data semak yang rosak ditapis semasa dimuat');

    // Kenali Kebenaran: karusel (Tugasan 7)
    await buka('s.kenali-kebenaran');
    const kiraan = () => page.locator('#kiraanSlaid').innerText();
    const tungguSlaid = n => page.waitForFunction(n => document.querySelector('#kiraanSlaid')?.textContent === `Slaid ${n} daripada 12` && document.querySelector('.trek').scrollLeft === (n - 1) * document.querySelector('.trek').clientWidth, n, { timeout: 4000 }).catch(() => {});
    const kiriKanan = () => page.evaluate(() => { const t = document.querySelector('.trek'); return Math.round(t.scrollLeft / t.clientWidth); });
    assert.equal(await page.locator('.slaid').count(), 12, 'Dua belas slaid');
    assert.equal(await kiraan(), 'Slaid 1 daripada 12');
    assert.equal(await page.locator('[data-arah="-1"]').isDisabled(), true, 'Butang sebelum dimatikan pada slaid 1');
    const teksKarusel = await page.locator('.karusel').innerText();
    for (const larang of [/@\w/, /TikTok/i, /felt demonic/i, /Disediakan oleh/i, /Geser/i]) assert.doesNotMatch(teksKarusel, larang, `Teks terlarang dalam karusel: ${larang}`);
    assert.match(teksKarusel, /Sahih al-Bukhari no\. 4920/);
    assert.equal(await page.locator('.slaid .ar[dir="rtl"]').count(), 10, 'Teks Arab RTL');
    await tiadaLimpahan('karusel'); await shot('karusel');
    await page.click('[data-arah="1"]'); await tungguSlaid(2);
    assert.equal(await kiraan(), 'Slaid 2 daripada 12', 'Butang seterusnya');
    assert.equal(await kiriKanan(), 1);
    await page.keyboard.press('ArrowRight'); await tungguSlaid(3);
    assert.equal(await kiraan(), 'Slaid 3 daripada 12', 'Kekunci anak panah kanan');
    await page.keyboard.press('ArrowLeft'); await tungguSlaid(2);
    assert.equal(await kiraan(), 'Slaid 2 daripada 12', 'Kekunci anak panah kiri');
    await page.locator('.trek .slaid').nth(1).locator('h2').scrollIntoViewIfNeeded();
    const kotakTrek = await page.locator('.trek .slaid').nth(1).locator('h2').boundingBox();
    await page.mouse.move(kotakTrek.x + 20, kotakTrek.y + kotakTrek.height / 2);
    await page.mouse.wheel(kotakTrek.width, 0); await tungguSlaid(3);
    assert.equal(await kiraan(), 'Slaid 3 daripada 12', 'Leret mendatar menukar slaid');
    await page.click('.titik button:nth-child(12)'); await tungguSlaid(12);
    assert.equal(await kiraan(), 'Slaid 12 daripada 12', 'Titik membuka slaid terakhir');
    assert.equal(await page.locator('[data-arah="1"]').isDisabled(), true);
    await page.click('[data-act="selesai"][data-slug="s-kenali-kebenaran"]'); await page.waitForTimeout(400);
    assert.equal(await kiraan(), 'Slaid 12 daripada 12', 'Kedudukan slaid kekal selepas tanda selesai');
    assert.equal(await kiriKanan(), 11);
    await buka('siri');
    assert.match(await page.locator('.siri-kad').nth(3).innerText(), /Karusel · 12 slaid[\s\S]*1\/1 selesai/i);

    // Kuliah Pemikiran (Tugasan 8)
    await buka('s.kuliah-pemikiran');
    assert.equal(await page.locator('.senarai-baris li').count(), 4, 'Empat kuliah');
    assert.match(await page.locator('.halaman-kepala').innerText(), /Mula kuliah 1/i);
    const kuliah = await page.evaluate(() => SIRI.find(s => s.slug === 'kuliah-pemikiran').episod);
    let jumlahSebab = 0;
    for (const [i, slug] of kuliah.slice(0, 3).entries()) {
      await buka('e.' + slug);
      assert.match(await page.locator('.artikel-kepala').innerText(), new RegExp(`Kuliah ${i + 1} daripada 4`, 'i'));
      jumlahSebab += await page.locator('.no-soal', { hasText: /^Sebab \d+$/ }).count();
      assert.ok(await page.locator('.ayat.petikan .ar[dir="rtl"]').count() >= 1, `Matan kitab dalam ${slug}`);
      assert.equal(await page.locator('.ayat .ruj, .ayat .tiada-ruj').count(), await page.locator('.ayat').count(), `Rujukan setiap blok dalam ${slug}`);
      const t = await page.locator('#kandungan').innerText();
      for (const larang of [/Jangan menamakan/i, /Bacakan teguran/i, /Wajib sampaikan/i, /belum disemak dalam kitab hadis/i, /claude\.ai/i]) assert.doesNotMatch(t, larang, `Nota penceramah ${larang} dalam ${slug}`);
      assert.match(t, /Amalan untuk minggu ini/);
    }
    assert.equal(jumlahSebab, 11, 'Sebelas sebab dalam tiga kuliah');

    await tiadaLimpahan('kuliah'); await shot('kuliah');

    // Kuliah 4: sumber luar WUI 1.0 (Tugasan 10–11)
    const mintaLuar = []; const catatLuar = r => { if (/youtube|ytimg|googlevideo/.test(r.url())) mintaLuar.push(r.url()); };
    page.on('request', catatLuar);
    await buka('e.kolonial-kapitalis-neoliberalisme');
    page.off('request', catatLuar);
    assert.deepEqual(mintaLuar, [], 'Tiada permintaan ke YouTube semasa halaman dibuka');
    assert.equal(await page.locator('iframe').count(), 0, 'Tiada video dibenam');
    assert.match(await page.locator('.artikel-kepala').innerText(), /Kuliah 4 daripada 4/i);
    const kredit = await page.locator('.kredit-luar').innerText();
    assert.match(kredit, /Sumber luar/i); assert.match(kredit, /Prof\. Farish/); assert.match(kredit, /Abdul Razak/);
    assert.equal(await page.locator('.kredit-luar a').getAttribute('href'), 'https://www.youtube.com/watch?v=4uPTvYYC9bw');
    const tonton = page.locator('.soalan-ep a.tonton');
    assert.equal(await tonton.count(), await page.locator('.soalan-ep').count(), 'Setiap bahagian ada pautan minit');
    assert.equal(await tonton.nth(1).getAttribute('href'), 'https://www.youtube.com/watch?v=4uPTvYYC9bw&t=420s');
    for (const a of await page.locator('#kandungan a[target="_blank"]').all()) assert.match(await a.getAttribute('rel'), /noopener/, 'Pautan luar guna noopener');
    // Dakwaan telah disemak pemilik (17 Nov 2026): masuk ke dalam isi, kotak "belum disemak" tiada
    assert.equal(await page.locator('.dakwaan-luar').count(), 0, 'Kotak dakwaan belum disemak dibuang');
    const prosa4 = await page.locator('#prosa').innerText();
    for (const isi of [/Nvidia/, /minyak sawit terbesar ke Israel/, /colouring the map blue/, /Lumumba/, /Financial Times/, /MSCI/, /AOPIG/, /75 tahun/, /konflik di Afrika/, /Snouck Hurgronje/]) assert.match(prosa4, isi, `Dakwaan dalam isi: ${isi}`);
    assert.equal(await page.locator('#integriti ol.dakwaan li').count(), 11, 'Kad integriti menyenaraikan 11 dakwaan');
    assert.equal(await page.locator('#integriti .dakwaan-fakta').count(), 0, 'Tiada dakwaan berlabel fakta tanpa sumber');
    assert.equal(await page.locator('#integriti ol.dakwaan li', { hasText: /Moderator:/ }).count(), 2, 'Dakwaan moderator dinisbahkan kepada moderator');
    assert.doesNotMatch(await page.locator('#integriti').innerText(), /belum disemak/i);
    assert.match(await page.locator('#integriti').innerText(), /disemak pemilik pada 17 Nov 2026/);
    assert.match(await page.locator('#integriti .sejarah').innerText(), /17 Nov 2026[\s\S]*disemak oleh pemilik/i, 'Sejarah versi mencatat semakan pemilik');
    assert.match(await page.locator('.soalan-ep').last().locator('a.tonton').innerText(), /minit 2:06:00/, 'Minit melebihi sejam dipapar sebagai j:mm:ss');
    assert.match(await page.locator('.bacaan-luar').innerText(), /Varoufakis/);
    const t4 = await page.locator('#kandungan').innerText();
    for (const larang of [/akan mati/i, /Tauri/i, /Captain Ibrahim/i, /Dubai chocolate/i]) assert.doesNotMatch(t4, larang, `Teks yang dikecualikan: ${larang}`);
    await tiadaLimpahan('kuliah4'); await shot('kuliah4');

    // Integrasi (Tugasan 5)
    await buka('teroka');
    await page.fill('#medanCari', 'benci kebenaran');
    assert.match(await page.locator('#hasilCari').innerText(), /Benci kepada Kebenaran/, 'Carian menemui episod');
    await page.fill('#medanCari', 'sifat malu');
    assert.match(await page.locator('#hasilCari').innerText(), /Sifat Malu/);
    assert.match(await page.locator('#hasilCari a[href^="#e."]').first().getAttribute('href'), /^#e\./, 'Kad carian membuka paparan episod');
    await buka('utama');
    assert.match(await page.locator('#kandungan').innerText(), /Siri terkini/i);
    await buka('e.kuasa-mutlak-allah');
    await page.click('[data-act="dengar"][data-slug="kuasa-mutlak-allah"]');
    await page.waitForTimeout(600);
    const ucapan = await page.evaluate(() => window.__ucapan);
    assert.ok(ucapan.length >= 3, 'Pemain Dengar membaca episod');
    assert.ok(ucapan.every(u => !/[؀-ۿ]/.test(u)), 'Teks Arab dilangkau oleh pemain');
    await page.click('[data-act="pemain-tutup"]');
    await buka('studio');
    const studio = await page.locator('#kandungan').innerText();
    assert.match(studio, /Semua bahan lulus semakan/i, 'Semakan integriti lulus');
    assert.match(studio, /12 hadis tanpa rujukan/i, 'Studio menyenaraikan hadis tanpa rujukan (11 skrip + 1 hadis fitrah kuliah)');
    await buka('profil'); await tiadaLimpahan('profil');
    assert.match(await page.locator('.statistik').first().innerText(), /\b1\s*bahan selesai/i, 'Karusel dan senarai semak tidak dikira sebagai bahan');

    for (const h of ['utama', 'a.kenapa-percaya-ramalan', 'kopi', 'studio', 'tentang']) { await buka(h); await tiadaLimpahan(h); }
    assert.deepEqual(errors, [], 'Tiada ralat konsol');
    await ctx.close();
  }

  // Episod bertarikh hadapan hanya dipaparkan apabila tarikhnya tiba
  {
    const ctx = await browser.newContext({ serviceWorkers: 'block', timezoneId: 'Asia/Kuala_Lumpur', viewport: { width: 400, height: 860 } });
    await ctx.route('https://fonts.googleapis.com/**', r => r.abort());
    const page = await ctx.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.clock.setFixedTime(new Date('2026-11-16T09:00:00+08:00'));
    const buka = async h => { await page.goto(origin + '#' + h); await page.waitForTimeout(250); };
    await buka('s.tadabbur-al-mukminun');
    const senarai = await page.locator('.senarai-baris').innerText();
    assert.match(senarai, /Menolak Kejahatan dengan Kebaikan/, 'Episod 11 Nov kelihatan');
    assert.doesNotMatch(senarai, /Rabbi Arji|Timbangan Amal|Penyesalan Ahli Neraka/i, 'Episod 18–26 Nov belum kelihatan');
    assert.match(await page.locator('.halaman-kepala').innerText(), /0 daripada 12 selesai/);
    await buka('e.permintaan-di-saat-nazak');
    assert.match(await page.locator('h1').innerText(), /tiada di rak/, 'Episod hadapan tidak boleh dibuka melalui pautan');
    await buka('teroka'); await page.fill('#medanCari', 'timbangan amal');
    assert.doesNotMatch(await page.locator('#hasilCari').innerText(), /Timbangan Amal Penentu/i, 'Carian tidak mendedahkan episod hadapan');
    await page.clock.setFixedTime(new Date('2026-11-18T06:00:00+08:00'));
    await buka('s.tadabbur-al-mukminun'); await page.reload(); await page.waitForTimeout(250);
    assert.match(await page.locator('.senarai-baris').innerText(), /Rabbi Arji/i, 'Episod muncul pada tarikhnya');
    assert.deepEqual(errors, [], 'Tiada ralat konsol (jam)');
    await ctx.close();
  }
  // Mod gelap, keadaan kosong (pengguna baharu) dan service worker
  {
    const ctx = await browser.newContext({ timezoneId: 'Asia/Kuala_Lumpur', colorScheme: 'dark', viewport: { width: 400, height: 860 } });
    await ctx.route('https://fonts.googleapis.com/**', r => r.abort());
    const page = await ctx.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.clock.setFixedTime(new Date('2026-11-27T09:00:00+08:00'));
    for (const h of ['siri', 's.tadabbur-al-mukminun', 'e.sifat-malu', 's.kenali-munafik', 's.kenali-kebenaran', 'e.buaian-pemikiran', 'e.kolonial-kapitalis-neoliberalisme', 'profil', 'studio']) {
      await page.goto(origin + '#' + h); await page.waitForTimeout(250);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0, `Limpahan mendatar (gelap) pada ${h}`);
      const [latar, teks] = await page.evaluate(() => [getComputedStyle(document.body).backgroundColor, getComputedStyle(document.querySelector('h1')).color]);
      assert.notEqual(latar, teks, `Teks kelihatan dalam mod gelap pada ${h}`);
    }
    if (shots) await page.screenshot({ path: `${shots}/gelap-siri.png`, fullPage: true });
    await page.goto(origin + '#siri'); await page.waitForTimeout(250);
    assert.match(await page.locator('.siri-kad').first().innerText(), /0\/15 selesai/, 'Keadaan kosong: tiada kemajuan');
    const cache = await page.evaluate(async () => {
      if (location.protocol !== 'https:') await navigator.serviceWorker.register('sw.js'); // app hanya mendaftar pada https
      const reg = await Promise.race([navigator.serviceWorker.ready, new Promise((_, gagal) => setTimeout(() => gagal(new Error('service worker tidak aktif')), 10000))]);
      const nama = (await caches.keys()).find(k => k.startsWith('ruang-ilmu-'));
      const c = await caches.open(nama);
      return { nama, siri: !!(await c.match('./siri.js')), aktif: !!reg.active };
    });
    assert.ok(cache.aktif && cache.siri, `Service worker menyimpan siri.js untuk luar talian (${cache.nama})`);
    assert.deepEqual(errors, [], 'Tiada ralat konsol (gelap)');
    await ctx.close();
  }
  await browser.close();
  console.log('Ruang Ilmu: ujian asap lulus');
})().catch(e => { console.error(e); process.exit(1); });
