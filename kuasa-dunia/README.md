# Kuasa Dunia

A base-building strategy game in the style of Clash of Clans, themed on geopolitical rivalry. Built with HTML, CSS, JavaScript and three.js (3D low-poly), playable on phone and desktop. Open `index.html` through any web server.

## Core loop

Collect resources, then upgrade, then train units, then plan the operation, then attack, then grow stronger, and repeat.

| Layer | In the game |
|---|---|
| Economy | Dana (industrial zones), Minyak (oil wells), Unsur Nadir (rare-earth mines from HQ 5), Intel (intelligence centre) |
| Time | Build, research and training timers keep running even when you are away |
| Combat | Ground units, air units (drones, helicopters), commanders with abilities, tactics |
| Social | An alliance formed from countries in the same bloc as your nation, troop donations, a Joint Operation |
| Goals | Daily missions, achievements, Fail Risikan cards, power phases (HQ 1–7), power tiers |

## Strategy and logistics systems

- **Choose a country.** You pick the country you lead from the dataset; Malaysia is the default. Resource strengths give bonuses: oil gives +20% oil and −10% logistics, finance gives +20% dana, technology makes research 20% faster, minerals give +30% rare earths.
- **Logistics.** Every operation costs oil based on distance in km. An alliance (allied base) gives a 25% discount.
- **Planning before the battle.**
  - Choose a doctrine: Serangan Kilat (Blitz), Tembakan Berat (Heavy Fire) or Pertahanan Berlapis (Layered Defence).
  - Reconnaissance costs 2 Intel and reveals enemy minefields.
- **Defences.**
  - Air units fly over walls, and only Air Defence and the Machine Gun Tower can hit them.
  - Radar extends the range of all defences by 15% while it is working.
- **Tactics.**
  - Perang Elektronik (Electronic Warfare) disables defences inside a circle.
  - Bekalan Udara (Air Supply) heals units.
  - Serangan Udara (Air Strike) bombs buildings.
- **Strategic operations** (Strategy menu, needs an Intelligence Centre). All are abstract: an Intel cost, an effect and a risk of exposure.
  - Propaganda: +10% unit damage for 3 operations.
  - Proxy support: enemy defence HP −20% for 2 operations.
  - False flag: the next operation does not raise tension and gives +30% loot. Exposure risk is high, and exposure brings sanctions.
  - Diplomatic mission: +10 image, −20 tension.
- **International image and tension.**
  - Every operation raises tension, and high tension makes attacks on your base while you are away more frequent.
  - Image below 30 triggers economic sanctions: production −30%.

All military operations target **fictional countries and forces** (`NAMA_LAWAN`, `KEMPEN`). Real countries are used only for country choice, blocs, allies and resource bonuses.

## Country dataset

`data.js` → `NEGARA`: about 45 countries with rounded 2024/2025 estimates from public sources (IMF, SIPRI). To add a country, copy one line:

```js
{ k: 'XX', n: 'Nama', wil: 'Asia Tenggara', blok: ['ASEAN'], kdnk: 100, pop: 10, belanja: 2, ll: [lat, lon],
  kuat: ['minyak'], sekutu: ['..'], seteru: [], tegang: [], nota: 'Situasi semasa ringkas.' },
```

- `kdnk` = GDP, USD billions.
- `belanja` = military spending, USD billions. It sets the power tier through `tierNegara()`.
- `kuat` takes `minyak` (oil), `nadir` (rare earths), `teknologi` (technology) or `kewangan` (finance).

Other files:

- `HIKAYAT`: Fail Risikan cards.
- `KUIZ`: the geopolitics quiz.
- `OPS`: the strategic operations.
- `B`, `TR`, `TAKTIK`, `DOKTRIN`: buildings, units, tactics and doctrines.
