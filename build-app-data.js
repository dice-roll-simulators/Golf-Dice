'use strict';
const fs = require('fs');
const path = require('path');
const {
  makeRng, buildWorld, sortedByOwgr, sortedByPgaPts,
  mastersField, pgaChampField, usOpenField, openChampField, TOP_120,
} = require('./sim');
const { RANK_121_200, REAL_EXTRA } = require('./data/players');
const {
  pointsWithTies, owgrTableFor, champTableFor, simulateRoundHoles, cutSizeFor,
  OWGR_MAJOR, OWGR_REGULAR, CHAMP_REGULAR, CHAMP_SIGNATURE, CHAMP_MAJOR,
} = require('./points');
const sumHoles = (holes) => holes.reduce((a, b) => a + b, 0);

const SEED = 20280101;
const rng = makeRng(SEED);
const YEAR = 2028;
const reg = buildWorld(rng);

// Real, current (Aug 2026) OWGR average-points snapshot for every player in
// the pool, captured BEFORE either simulated event — the client uses this as
// the fixed base that live tournament results are added on top of.
const startingOwgr = {};
reg.byId.forEach((p) => { startingOwgr[p.name] = p.owgr; });

function fieldOut(field) {
  return field.slice().sort((a, b) => b.owgr - a.owgr).map((p) => ({ name: p.name, country: p.country, tag: p.tag }));
}
function weekBefore() { return sortedByOwgr(reg); }
function pgaBefore() { return sortedByPgaPts(reg); }

// Simulate one tournament end-to-end: rounds 1-2 for the whole field, a cut
// to the tournament's cut size (place + ties), rounds 3-4 for who survives,
// then the real point tables (group decides which OWGR/Championship curve
// applies) — missed-cut players score 0 either way, same as real golf.
function simulateTournament(field, group, cutSize) {
  // Each player's round is stored as the 18 individual hole results (to-par)
  // — the same shape a hand-entered round takes — not a single pre-summed number.
  function rollRound(players) {
    const m = {};
    players.forEach((p) => { m[p.name] = simulateRoundHoles(rng); });
    return m;
  }
  const r1 = rollRound(field);
  const r2 = rollRound(field);
  const thru2 = field.map((p) => ({ p, total: sumHoles(r1[p.name]) + sumHoles(r2[p.name]) }))
    .sort((a, b) => a.total - b.total || a.p.name.localeCompare(b.p.name));
  const cutValue = thru2.length > cutSize ? thru2[cutSize - 1].total : Infinity;
  const madeCut = thru2.filter((x) => x.total <= cutValue).map((x) => x.p);
  const missedCut = thru2.filter((x) => x.total > cutValue).map((x) => x.p);

  const r3 = rollRound(madeCut);
  const r4 = rollRound(madeCut);
  const standings = madeCut.map((p) => ({ p, total: sumHoles(r1[p.name]) + sumHoles(r2[p.name]) + sumHoles(r3[p.name]) + sumHoles(r4[p.name]) }))
    .sort((a, b) => a.total - b.total || a.p.name.localeCompare(b.p.name));

  const owgrTable = owgrTableFor(group);
  const champTable = champTableFor(group);
  const owgrPts = pointsWithTies(standings, owgrTable);
  const champPts = pointsWithTies(standings, champTable);
  standings.forEach(({ p }, i) => {
    p.owgr = Math.round((p.owgr + owgrPts[i]) * 10000) / 10000;
    p.pgaPts = Math.round((p.pgaPts + champPts[i]) * 1000) / 1000;
  });
  // Missed-cut players earn 0 — nothing to add, but they still played 2 real rounds.

  const scores = { r1, r2, r3, r4 };
  return {
    scores,
    standings: standings.map(({ p, total }) => ({ name: p.name, country: p.country, total })),
    missedCut: missedCut.map((p) => p.name),
  };
}

const championshipRoster = () => fieldOut(TOP_120.map(([n]) => reg.byName.get(n)));

const CHAMP_EVENTS = [
  ["farmers", "Farmers Insurance Open", "Jan 27–30"],
  ["phoenix", "WM Phoenix Open", "Feb 3–6"],
  ["pebble", "AT&T Pebble Beach Pro-Am", "Feb 10–13"],
  ["genesis", "The Genesis Invitational", "Feb 24–27"],
  ["miami", "Cadillac Championship", "Mar 9–12"],
  ["arnold", "Arnold Palmer Invitational", "Mar 23–26"],
  ["houston", "Texas Children's Houston Open", "Mar 27–Apr 2"],
  ["heritage", "RBC Heritage", "Apr 20–23"],
  ["truist", "Truist Championship", "May 18–21"],
  ["memorial", "the Memorial Tournament", "Jun 8–11"],
  ["travelers", "Travelers Championship", "Jun 29–Jul 2"],
  ["scottishopen", "Genesis Scottish Open", "Jul 13–16"],
  ["finale", "Championship Series Finale", "Aug 17–20"],
  ["matchgroup", "TOUR Championship — Group Stage", "Aug 24–26"],
  ["matchko", "TOUR Championship — Knockout", "Aug 31–Sep 3"],
];
const CHAMP_BY_KEY = new Map(CHAMP_EVENTS.map((e) => [e[0], e]));
function pushChamp(...keys) {
  keys.forEach((key) => {
    const [, name, dates] = CHAMP_BY_KEY.get(key);
    tournaments.push({ key, name, dates, group: 'champ', cutSize: cutSizeFor(key) });
  });
}

const tournaments = [];
const seedScores = {};
const simulatedLog = [];

// --- Jan-Mar: champ events up to and including Pebble Beach (which we simulate) ---
pushChamp('farmers', 'phoenix', 'pebble', 'genesis', 'miami');

// Simulate Pebble Beach now (first event of the two we're asked to run).
{
  const field = TOP_120.map(([n]) => reg.byName.get(n));
  const result = simulateTournament(field, 'champ', cutSizeFor('pebble'));
  seedScores.pebble = result.scores;
  simulatedLog.push({ key: 'pebble', name: 'AT&T Pebble Beach Pro-Am', winner: result.standings[0], missedCut: result.missedCut.length });
}

// --- THE PLAYERS: field reflects the World Ranking right after Pebble Beach ---
{
  const field = weekBefore().slice(0, 156);
  tournaments.push({ key: 'players', name: 'THE PLAYERS Championship', dates: 'Mar 16–19', group: 'players', field: fieldOut(field), cutSize: cutSizeFor('players') });
}

pushChamp('arnold', 'houston');

// --- Masters: field built from post-Pebble-Beach ranking + points, then simulated ---
{
  const built = mastersField(reg, weekBefore(), pgaBefore(), rng, YEAR);
  tournaments.push({ key: 'masters', name: 'Masters Tournament', dates: 'Apr 13–16', group: 'major', field: fieldOut(built.field), target: built.target, categories: built.categories, cutSize: cutSizeFor('masters') });
  const result = simulateTournament(built.field, 'major', cutSizeFor('masters'));
  seedScores.masters = result.scores;
  simulatedLog.push({ key: 'masters', name: 'Masters Tournament', winner: result.standings[0], missedCut: result.missedCut.length });
}

pushChamp('heritage', 'truist', 'memorial', 'travelers');

const majorMeta = { pga: ['PGA Championship', 'May 25–28'], usopen: ['U.S. Open', 'Jun 22–25'], open: ['The Open Championship', 'Jul 20–23'] };
[['pga', pgaChampField], ['usopen', usOpenField], ['open', openChampField]].forEach(([key, fn]) => {
  const built = fn(reg, weekBefore(), rng, YEAR);
  tournaments.push({ key, name: majorMeta[key][0], dates: majorMeta[key][1], group: 'major', field: fieldOut(built.field), categories: built.categories, cutSize: cutSizeFor(key) });
});

pushChamp('scottishopen', 'finale', 'matchgroup', 'matchko');

// Champ-group tournaments all share one roster rather than each carrying a copy.
const roster = championshipRoster();
tournaments.forEach((t) => { if (t.group === 'champ') t.field = roster; });
// Re-sort into the real chronological order for display.
const ORDER = ['farmers', 'phoenix', 'pebble', 'genesis', 'miami', 'players', 'arnold', 'houston', 'masters', 'heritage', 'truist', 'memorial', 'travelers', 'pga', 'usopen', 'open', 'scottishopen', 'finale', 'matchgroup', 'matchko'];
tournaments.sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key));

const appData = {
  seed: SEED,
  year: YEAR,
  tournaments,
  championshipRosterSize: 120,
  backgroundPool: fieldOut([...RANK_121_200, ...REAL_EXTRA].map(([n]) => reg.byName.get(n))).map((p, i) => Object.assign({ rank: 121 + i }, p)),
  seedScores,
  // The seeded results are already-finished tournaments — ship them pre-locked
  // so the client doesn't show an editable, unlocked Pebble Beach/Masters.
  seedLocked: Object.fromEntries(Object.keys(seedScores).map((key) => [key, { r1: true, r2: true, r3: true, r4: true }])),
  startingOwgr,
  pointTables: { owgrMajor: OWGR_MAJOR, owgrRegular: OWGR_REGULAR, champRegular: CHAMP_REGULAR, champSignature: CHAMP_SIGNATURE, champMajor: CHAMP_MAJOR },
};

fs.writeFileSync(path.join(__dirname, 'output', 'app-data.json'), JSON.stringify(appData));
console.log('tournaments:', tournaments.map((t) => `${t.key}(${t.field.length})`).join(' '));
console.log('backgroundPool:', appData.backgroundPool.length);
simulatedLog.forEach((s) => console.log('SIMULATED', s.name, '-> winner', s.winner.name, s.winner.total, `(${s.missedCut} missed cut)`));
