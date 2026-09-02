'use strict';
const fs = require('fs');
const path = require('path');
const { makeRng, buildWorld, TOP_120 } = require('./sim');
const { RANK_121_200, REAL_EXTRA, PAST_CHAMPIONS, NAME_BANK } = require('./data/players');
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

// Simulate Pebble Beach now — the one pre-seeded demo result. Every major
// and THE PLAYERS below starts genuinely unplayed (field: []): the client
// builds each one's field itself, live, off the real World Ranking and
// Championship Series standings at the moment the tournament immediately
// before it in the schedule gets locked in — never predetermined here.
{
  const field = TOP_120.map(([n]) => reg.byName.get(n));
  const result = simulateTournament(field, 'champ', cutSizeFor('pebble'));
  seedScores.pebble = result.scores;
  simulatedLog.push({ key: 'pebble', name: 'AT&T Pebble Beach Pro-Am', winner: result.standings[0], missedCut: result.missedCut.length });
}

pushChamp('arnold');
tournaments.push({ key: 'players', name: 'THE PLAYERS Championship', dates: 'Mar 16–19', group: 'players', field: [], cutSize: cutSizeFor('players') });
pushChamp('houston');
tournaments.push({ key: 'masters', name: 'Masters Tournament', dates: 'Apr 13–16', group: 'major', field: [], cutSize: cutSizeFor('masters') });
pushChamp('heritage', 'truist');
tournaments.push({ key: 'pga', name: 'PGA Championship', dates: 'May 25–28', group: 'major', field: [], cutSize: cutSizeFor('pga') });
pushChamp('memorial');
tournaments.push({ key: 'usopen', name: 'U.S. Open', dates: 'Jun 22–25', group: 'major', field: [], cutSize: cutSizeFor('usopen') });
pushChamp('travelers', 'scottishopen');
tournaments.push({ key: 'open', name: 'The Open Championship', dates: 'Jul 20–23', group: 'major', field: [], cutSize: cutSizeFor('open') });
pushChamp('finale', 'matchgroup', 'matchko');

// Champ-group tournaments all share one roster rather than each carrying a copy.
const roster = championshipRoster();
tournaments.forEach((t) => { if (t.group === 'champ') t.field = roster; });
// Re-sort into the real chronological order for display — THE PLAYERS and
// each major slot in right after the event that immediately precedes it.
const ORDER = ['farmers', 'phoenix', 'pebble', 'genesis', 'miami', 'arnold', 'players', 'houston', 'masters', 'heritage', 'truist', 'pga', 'memorial', 'usopen', 'travelers', 'scottishopen', 'open', 'finale', 'matchgroup', 'matchko'];
tournaments.sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key));

// Champ events all share one `field` array/order (the roster, by ranking) —
// without this, every tournament's Round 1 tee sheet would list players in
// the identical order. Each tournament gets its own independent shuffle
// (never mutating `field` itself, which majors/Players also rely on for
// cut/points bookkeeping) used purely as that event's starting draw order.
function shuffled(list, rand) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
tournaments.forEach((t) => { t.startOrder = shuffled(t.field, rng).map((p) => p.name); });

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
  // Raw ingredients for the client's own live major/THE PLAYERS field
  // construction — past-champion exemptions and the fictional PGA
  // Championship club-pro name bank. The ranking/points portion of each
  // field is built from the live World Ranking/Championship Series
  // standings instead, computed client-side when it's actually needed.
  pastChampions: PAST_CHAMPIONS,
  clubProNames: NAME_BANK,
};

fs.writeFileSync(path.join(__dirname, 'output', 'app-data.json'), JSON.stringify(appData));
console.log('tournaments:', tournaments.map((t) => `${t.key}(${t.field.length})`).join(' '));
console.log('backgroundPool:', appData.backgroundPool.length);
simulatedLog.forEach((s) => console.log('SIMULATED', s.name, '-> winner', s.winner.name, s.winner.total, `(${s.missedCut} missed cut)`));
