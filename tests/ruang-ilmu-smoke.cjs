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
    const ctx = await browser.newContext({ serviceWorkers: 'block', viewport });
    if (!process.env.FONTS) await ctx.route('https://fonts.googleapis.com/**', r => r.abort());
    const page = await ctx.newPage(); const errors = [];
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
    assert.match(await page.locator('.halaman-kepala').innerText(), /1 daripada 1 selesai/, 'Kemajuan siri dikemas kini');
    await buka('siri');
    assert.match(await page.locator('.siri-kad').first().innerText(), /1\/1 selesai/);

    for (const h of ['utama', 'a.kenapa-percaya-ramalan', 'kopi', 'studio', 'tentang']) { await buka(h); await tiadaLimpahan(h); }
    assert.deepEqual(errors, [], 'Tiada ralat konsol');
    await ctx.close();
  }
  await browser.close();
  console.log('Ruang Ilmu: ujian asap lulus');
})().catch(e => { console.error(e); process.exit(1); });
