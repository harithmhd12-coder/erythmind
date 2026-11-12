/* Ujian asap Tuntas. Jalankan sambil menghidangkan repo ini:
   python3 -m http.server 8000 --bind 127.0.0.1 &  node tests/tuntas-smoke.cjs
   Jam browser dikawal supaya satu hari penuh (ikrar → fokus → gangguan → siap → muhasabah → hutang esok) diuji dalam beberapa saat. */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const origin = (process.env.TEST_ORIGIN || 'http://127.0.0.1:8000') + '/tuntas/';
const shots = process.env.SHOTS || '';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 400, height: 860 } });
  await ctx.route('https://fonts.googleapis.com/**', r => r.abort());
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.clock.install({ time: new Date('2026-11-12T08:00:00') });
  await page.goto(origin);
  const shot = async n => { if (shots) await page.screenshot({ path: `${shots}/${n}.png`, fullPage: true }); };
  const hold = async (sel, ms) => { const b = page.locator(sel); await b.scrollIntoViewIfNeeded(); const box = await b.boundingBox(); await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await page.clock.runFor(ms + 300); await page.mouse.up(); };

  // Ikrar pagi
  assert.match(await page.locator('.murabbi').innerText(), /Ikrar sebelum 09:00/);
  await shot('1-ikrar');
  assert.equal(await page.locator('[data-act="ikrar"]').isDisabled(), true, 'Ikrar dikunci sebelum lengkap');
  await page.click('[data-act="drafEmosi"][data-e="malas"]');
  await page.click('[data-act="drafTenaga"][data-n="3"]');
  const berat = page.locator('.pilih-tugas input[data-act="drafPilih"]').first();
  await berat.click();
  assert.equal(await page.locator('.kumpulan').nth(0).locator('input[data-act="drafPilih"]').nth(1).isDisabled(), true, 'Hanya satu tugasan Berat');
  await page.locator('input[data-f="takrif"]').first().fill('Draf bahagian 2 lengkap dengan 5 rujukan');
  const harian = page.locator('.kumpulan').nth(1).locator('input[data-act="drafPilih"]').first();
  await harian.click();
  await page.locator('input[data-f="takrif"]').nth(1).fill('Lima soal-jawab Subuh siap disemak');
  await hold('[data-act="ikrar"]', 2500);
  assert.equal(await page.locator('.tugas').count(), 2);
  assert.match(await page.locator('.tugas').nth(0).innerText(), /negara Islam/);
  assert.equal(await page.locator('.tugas').nth(1).locator('[data-act="mulaFokus"]').count(), 0, 'Tugasan kedua terkunci');
  await shot('2-pelan');

  // Fokus: emosi malas membuka Peraturan 2 minit
  await page.click('[data-act="mulaFokus"]');
  assert.equal(await page.locator('#fokus').isVisible(), true);
  assert.equal(await page.locator('#tab').isVisible(), false, 'Tab disembunyikan semasa fokus');
  await page.click('[data-act="emosiSebelum"][data-e="malas"]');
  assert.equal(await page.locator('#ivMula').isDisabled(), true);
  await page.fill('#ivTeks', 'Buka fail dan tulis tajuk bahagian 2');
  await page.click('#ivMula');
  await page.clock.runFor(10 * 60000);
  assert.match(await page.locator('#jam').innerText(), /^80:0\d$/);
  await shot('3-fokus');

  // Gangguan: keluar dari app dicatat
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.clock.runFor(30000);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
  assert.match(await page.locator('.ganggu').innerText(), /1\/2/);

  // Dorongan: tunggang ombak 90 saat
  await page.click('[data-act="dorongan"]');
  await page.click('[data-act="dorJenis"]');
  assert.equal(await page.locator('#dorMenang').isDisabled(), true);
  await page.clock.runFor(91000);
  await page.click('#dorMenang');

  // Blok tamat → belum siap → rehat → blok kedua → siap awal dengan bukti
  await page.clock.runFor(85 * 60000);
  assert.match(await page.locator('#fokus h2').innerText(), /Blok tamat/i);
  await page.click('[data-act="emosiSelepas"][data-e="letih"]');
  await page.click('[data-act="tamatBelum"]');
  await page.clock.runFor(15 * 60000 + 2000);
  await page.click('[data-act="sambungRehat"]');
  await page.click('[data-act="emosiSebelum"][data-e="cemas"]');
  assert.match(await page.locator('#fokus').innerText(), /Pernafasan kotak/);
  await page.clock.runFor(65000);
  await page.click('#ivMula');
  await page.clock.runFor(20 * 60000);
  await page.click('[data-act="siapAwal"]');
  await page.fill('#bukti', 'Bahagian 2: 2,100 patah perkataan, 5 rujukan Shamela');
  await page.check('#sahTakrif');
  await hold('[data-act="sahkanSiap"]', 1500);
  assert.equal(await page.locator('#fokus').isVisible(), false);
  assert.equal(await page.locator('.tugas.siap').count(), 1);

  // Muhasabah dibuka 18:00; tugasan kedua belum siap → hutang
  await page.clock.setSystemTime(new Date('2026-11-12T18:05:00'));
  await page.clock.runFor(2000);
  await page.click('#tab [data-tab="hari"]');
  assert.match(await page.locator('.amaran').first().innerText(), /1 tugasan belum siap/);
  await page.click('[data-act="mEmosi"][data-e="letih"]');
  for (const [id, v] of [['menang', 'Siapkan bahagian 2 walaupun malas'], ['halang', 'Telefon di atas meja'], ['syukur', 'Sihat'], ['ajar', 'Mula lebih awal pagi'], ['esok', 'Soal-jawab Subuh']]) await page.fill(`#m_${id}`, v);
  await hold('[data-act="tutupHari"]', 2000);
  if (process.env.DEBUG) console.log('toast:', await page.locator('#toast').innerText(), JSON.stringify(await page.evaluate(() => S.draf)));
  assert.match(await page.locator('.lencana.merah').last().innerText(), /GAGAL/);

  // Esok: hutang wajib dibawa
  await page.clock.setSystemTime(new Date('2026-11-13T07:30:00'));
  await page.clock.runFor(2000);
  assert.match(await page.locator('#paparan').innerText(), /Hutang kerja · wajib dibawa/i);
  assert.match(await page.locator('.cip-baris').innerText(), /hutang\s+1/);
  await shot('4-hutang');

  // Minimalis & Rekod
  await page.click('#tab [data-tab="minimalis"]');
  await page.fill('#tungguNama', 'Fon kepala baharu'); await page.fill('#tungguHarga', '299');
  await page.click('[data-act="tambahTunggu"]');
  assert.equal(await page.locator('[data-act="tungguBeli"]').isDisabled(), true, 'Beli dikunci 30 hari');
  await shot('5-minimalis');
  await page.click('#tab [data-tab="rekod"]');
  assert.equal(await page.locator('.sel.gagal').count(), 1);
  assert.match(await page.locator('#paparan').innerText(), /Peta emosi/i);
  await shot('6-rekod');

  assert.deepEqual(errors, []);
  console.log('tuntas-smoke: lulus');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
