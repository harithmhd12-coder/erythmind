/* Laras bahasa Ruang Ilmu (rujuk ruang-ilmu/GAYA.md).
   Digunakan oleh tests/ruang-ilmu-smoke.cjs. Jalankan sendiri untuk menjana semula cap jari:
   node tests/ruang-ilmu-laras.cjs --cap-jari   (hanya apabila matan/terjemahan/rujukan sengaja diubah) */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const FAIL_CAP_JARI = path.join(__dirname, 'ruang-ilmu-cap-jari.json');

/* Pola yang bercanggah dengan GAYA.md. */
const POLA_TERLARANG = [
  [/\btelahpun\b/i, 'telahpun → telah pun'],
  [/\badalah merupakan\b/i, 'adalah merupakan → ialah/merupakan'],
  [/\badalah dengan\b/i, 'adalah dengan → ialah'],
  [/\bkarena\b/i, 'karena → kerana'],
  [/\bonline\b/i, 'online → dalam talian'],
  [/\bsyubhah\b/i, 'syubhah → syubhat'],
  [/[a-z,;] Al-Quran\b/, 'Al-Quran di tengah ayat → al-Quran'],
  [/\b(?:Nabi|Rasul) \S+ AS\b/, 'AS → a.s.'],
  [/\bdi era\b/i, 'di era → dalam era'],
  [/\bkenapa\b/i, 'kenapa → mengapa(kah)'],
  [/(?:^|[\s(])(?:RA|R\.A\.)(?=[\s:,.)]|$)/, 'RA → r.a.'],
  [/\bhadith\b/i, 'hadith → hadis'],
  [/\bsekaligus\b/i, 'sekaligus → sekali gus'],
  [/\btaqwa\b/i, 'taqwa → takwa'],
  [/\bcitarasa\b/i, 'citarasa → cita rasa']
];

/* Dijalankan dalam pelayar: kumpul blok dilindungi dan teks data yang boleh disunting. */
const kumpul = () => {
  const dilindungi = {}; const teks = [];
  const tambahLindung = (k, b) => { (dilindungi[k] ||= []).push([b.ar || '', b.maksud || '', b.ruj || '', b.ruj2 || '']); };
  const tambahTeks = (k, t) => { if (t) teks.push([k, String(t)]); };
  EPISOD.filter(e => !e.isiBuku).forEach(e => {
    tambahTeks(e.slug, e.tajuk);
    e.soalan.forEach(q => { tambahTeks(e.slug, q.s); q.blok.forEach(b => b.j === 'teks' ? tambahTeks(e.slug, b.t) : tambahLindung(e.slug, b)); });
    (e.dakwaan || []).forEach(d => tambahTeks(e.slug, typeof d === 'string' ? d : d.t));
    if (e.luar) tambahTeks(e.slug, e.luar.nota);
  });
  SIRI.forEach(s => { tambahTeks('siri', s.nama); tambahTeks('siri', s.ringkas); });
  Object.entries(SEMAK).forEach(([k, d]) => {
    d.pengenalan.forEach(p => tambahTeks(k, p));
    d.kumpulan.forEach(g => { tambahTeks(k, g.tajuk); g.item.forEach(x => { tambahTeks(k, x.t); if (x.dalil) tambahLindung(k, x.dalil); }); });
    tambahLindung(k, d.doa);
  });
  Object.entries(KARUSEL).forEach(([k, d]) => d.slaid.forEach(x => {
    [x.label, x.tajuk, x.petik, ...(x.isi || []), ...(x.langkah || []), ...(x.alur || []), ...(x.nota || []), ...(x.butir || []).flat()].forEach(t => tambahTeks(k, t));
    tambahLindung(k, x);
  }));
  KANDUNGAN.forEach(a => {
    [a.tajuk, a.dek, a.ringkas60, a.refleksi, a.kepentingan, ...(a.bahagian || []).flatMap(b => [b.h, ...b.p]), ...(a.fakta || []).map(f => f.t || f),
      ...(a.dakwaan || []).map(d => d.t || d), ...(a.kuiz || []).flatMap(q => [q.s, ...(q.p || []), q.h])].forEach(t => tambahTeks(a.slug, t));
    tambahLindung(a.slug, { ruj: JSON.stringify(a.rujukan || []) });
  });
  return { dilindungi, teks };
};

const capJari = dilindungi => Object.fromEntries(Object.entries(dilindungi).sort().map(([k, v]) => [k, crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex').slice(0, 16)]));

const semakTeks = teks => {
  const isu = [];
  teks.forEach(([k, t]) => POLA_TERLARANG.forEach(([re, cadangan]) => { const m = t.match(re); if (m) isu.push(`${k}: "${m[0]}" (${cadangan}) dalam: ${t.slice(Math.max(0, m.index - 40), m.index + 40)}`); }));
  return isu;
};

module.exports = { kumpul, capJari, semakTeks, POLA_TERLARANG, FAIL_CAP_JARI };

if (require.main === module) {
  (async () => {
    const { chromium } = require('playwright');
    const origin = (process.env.TEST_ORIGIN || 'http://127.0.0.1:8000') + '/ruang-ilmu/';
    const b = await chromium.launch(); const p = await b.newPage();
    await p.goto(origin); await p.waitForTimeout(300);
    const { dilindungi, teks } = await p.evaluate(kumpul);
    if (process.argv.includes('--cap-jari')) { fs.writeFileSync(FAIL_CAP_JARI, JSON.stringify(capJari(dilindungi), null, 1) + '\n'); console.log(`Cap jari ditulis: ${Object.keys(dilindungi).length} bahan`); }
    const isu = semakTeks(teks); console.log(isu.join('\n') || 'Tiada isu laras'); console.log(`${isu.length} isu, ${teks.length} teks`);
    await b.close();
  })().catch(e => { console.error(e); process.exit(1); });
}
