'use strict';

const { TOP_120, RANK_121_200, REAL_EXTRA, PAST_CHAMPIONS, NAME_BANK } = require('./data/players');
const { realWorldOwgr } = require('./points');

// ---------- seeded RNG (mulberry32) so a run is reproducible ----------
function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const EU_COUNTRIES = ["ENG","SCO","IRL","WAL","FRA","GER","SWE","ESP","ITA","NOR","DEN","BEL","NED","AUT","FIN"];

// ---------- player registry ----------
let nextId = 1;
function makeRegistry() {
  const byId = new Map();
  const byName = new Map();
  function add(name, country, opts) {
    const existing = byName.get(name);
    if (existing) return existing;
    const p = Object.assign({
      id: nextId++,
      name, country,
      fixed120: false,
      owgr: 0,
      pgaPts: 0,
      tag: opts && opts.tag || 'tour',
    }, opts || {});
    byId.set(p.id, p);
    byName.set(name, p);
    return p;
  }
  return { byId, byName, add };
}

function initialOwgr(rank) {
  return realWorldOwgr(rank);
}

function buildWorld(rng) {
  const reg = makeRegistry();

  TOP_120.forEach(([name, country], i) => {
    const p = reg.add(name, country, { fixed120: true, tag: 'elite' });
    p.owgr = initialOwgr(i + 1);
  });
  RANK_121_200.forEach(([name, country], i) => {
    const p = reg.add(name, country, { tag: 'tour' });
    p.owgr = initialOwgr(121 + i);
  });
  // Real Korn Ferry Tour / DP World Tour players, ranked beyond 200 — the
  // "not in the Championship Series" pool for background events and major
  // random-qualifier slots. No procedurally-generated names in this pool.
  REAL_EXTRA.forEach(([name, country], i) => {
    const p = reg.add(name, country, { tag: 'tour' });
    p.owgr = initialOwgr(201 + i);
  });

  return reg;
}

function resolveLegacy(reg, name, birthYear, country, rng) {
  let p = reg.byName.get(name);
  if (p) return p;
  p = reg.add(name, country, { tag: 'legacy', birthYear });
  p.owgr = 0.05 + rng() * 0.3; // aging former champion, minimal current ranking
  return p;
}

// ---------- ranking snapshots ----------
function sortedByOwgr(reg) {
  return Array.from(reg.byId.values()).sort((a, b) => b.owgr - a.owgr);
}
function sortedByPgaPts(reg) {
  return Array.from(reg.byId.values()).sort((a, b) => b.pgaPts - a.pgaPts);
}

// ---------- weighted finish order (Efraimidis-Spirakis A-Res) ----------
function simulateFinish(field, rng) {
  const withKeys = field.map((p) => {
    const weight = p.owgr + 8; // floor so everyone has a live shot
    const key = Math.pow(rng(), 1 / weight);
    return { p, key };
  });
  withKeys.sort((a, b) => b.key - a.key);
  return withKeys.map((x) => x.p);
}

function pointsTable(base, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const v = base * Math.pow(0.84, i);
    out.push(v < 0.3 ? 0 : Math.round(v * 10) / 10);
  }
  return out;
}

function applyResult(order, { owgrBase, pgaBase }) {
  const owgrPts = pointsTable(owgrBase, order.length);
  const pgaPts = pgaBase ? pointsTable(pgaBase, order.length) : null;
  order.forEach((p, i) => {
    p.owgr = Math.round((p.owgr + owgrPts[i]) * 100) / 100;
    if (pgaPts) p.pgaPts = Math.round((p.pgaPts + pgaPts[i]) * 100) / 100;
  });
}

// ---------- random fill for major fields ----------
function randomFill(reg, already, targetTotal, rng, bias) {
  // Real, currently-active tour players only — never a legacy exemption or a
  // procedurally-generated club pro from another major's field construction.
  const pool = Array.from(reg.byId.values()).filter((p) => !already.has(p.id) && p.tag !== 'legacy' && p.tag !== 'clubpro');
  const out = [];
  const isEU = (c) => EU_COUNTRIES.includes(c);
  while (already.size + out.length < targetTotal && pool.length) {
    let idx;
    if (bias === 'US') {
      idx = pickBiased(pool, rng, (p) => p.country === 'USA', 0.75);
    } else if (bias === 'EU') {
      idx = pickBiased(pool, rng, (p) => isEU(p.country), 0.7);
    } else {
      idx = Math.floor(rng() * pool.length);
    }
    const [chosen] = pool.splice(idx, 1);
    out.push(chosen);
  }
  return out;
}
function pickBiased(pool, rng, matchFn, biasProb) {
  const wantMatch = rng() < biasProb;
  for (let attempts = 0; attempts < 40; attempts++) {
    const idx = Math.floor(rng() * pool.length);
    if (matchFn(pool[idx]) === wantMatch) return idx;
  }
  return Math.floor(rng() * pool.length);
}

// ---------- major field builders ----------
function mastersField(reg, weekBefore, pgaBefore, rng, year) {
  const set = new Map();
  weekBefore.slice(0, 50).forEach((p) => set.set(p.id, p));
  pgaBefore.slice(0, 30).forEach((p) => set.set(p.id, p));
  PAST_CHAMPIONS.masters.forEach(([name, by, country]) => {
    if (year - by < 70) {
      const p = resolveLegacy(reg, name, by, country, rng);
      set.set(p.id, p);
    }
  });
  const target = 90 + Math.floor(rng() * 11); // 90-100
  const already = new Set(set.keys());
  if (set.size < target) {
    randomFill(reg, already, target, rng, null).forEach((p) => set.set(p.id, p));
  }
  return { field: Array.from(set.values()), target, categories: { ranking: 50, pgaPoints: 30 } };
}

function pgaChampField(reg, weekBefore, rng, year) {
  const set = new Map();
  weekBefore.slice(0, 120).forEach((p) => set.set(p.id, p));
  const under60 = PAST_CHAMPIONS.pga.filter(([, by]) => year - by < 60);
  const pickList = under60.length >= 10 ? under60 : PAST_CHAMPIONS.pga.filter(([, by]) => year - by < 70);
  pickList.slice(0, 10).forEach(([name, by, country]) => {
    const p = resolveLegacy(reg, name, by, country, rng);
    set.set(p.id, p);
  });
  const clubPros = [];
  for (let i = 0; i < 20; i++) {
    let name;
    do {
      const f = NAME_BANK.clubPro[Math.floor(rng() * NAME_BANK.clubPro.length)];
      const l = NAME_BANK.clubProLast[Math.floor(rng() * NAME_BANK.clubProLast.length)];
      name = `${f} ${l}`;
    } while (reg.byName.has(name));
    const p = reg.add(name, 'USA', { tag: 'clubpro' });
    p.owgr = rng() * 0.05;
    clubPros.push(p);
    set.set(p.id, p);
  }
  return { field: Array.from(set.values()), categories: { ranking: 120, pastChamps: pickList.slice(0, 10).length, clubPros: 20 } };
}

function usOpenField(reg, weekBefore, rng, year) {
  const set = new Map();
  weekBefore.slice(0, 100).forEach((p) => set.set(p.id, p));
  PAST_CHAMPIONS.usopen.forEach(([name, by, country]) => {
    if (year - by < 70) { const p = resolveLegacy(reg, name, by, country, rng); set.set(p.id, p); }
  });
  const already = new Set(set.keys());
  randomFill(reg, already, 150, rng, 'US').forEach((p) => set.set(p.id, p));
  return { field: Array.from(set.values()), categories: { ranking: 100 } };
}

function openChampField(reg, weekBefore, rng, year) {
  const set = new Map();
  weekBefore.slice(0, 100).forEach((p) => set.set(p.id, p));
  PAST_CHAMPIONS.open.forEach(([name, by, country]) => {
    if (year - by < 70) { const p = resolveLegacy(reg, name, by, country, rng); set.set(p.id, p); }
  });
  const already = new Set(set.keys());
  randomFill(reg, already, 150, rng, 'EU').forEach((p) => set.set(p.id, p));
  return { field: Array.from(set.values()), categories: { ranking: 100 } };
}

module.exports = {
  makeRng, buildWorld, sortedByOwgr, sortedByPgaPts, simulateFinish, applyResult,
  mastersField, pgaChampField, usOpenField, openChampField, TOP_120,
};
