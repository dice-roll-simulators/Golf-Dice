'use strict';

// Real-world anchors, sourced per the user's links:
// - OWGR points by finish: https://www.owgr.com/events/the-154th-open-11468 (major)
//   and https://www.owgr.com/events/cadillac-championship-11319 (non-major).
// - Championship Series season points: https://en.wikipedia.org/wiki/List_of_point_distributions_of_the_FedEx_Cup
// Between the given anchors we interpolate linearly; every table tapers to 0
// at the last anchor (the realistic points/made-cut cutoff).
const OWGR_MAJOR = [
  [1, 100], [2, 60], [3, 40], [4, 27], [6, 18], [9, 13], [14, 9.25], [18, 6.2],
  [28, 4.15833], [40, 3.25], [46, 2.6], [53, 1.95], [59, 1.46666], [65, 1.3],
  [67, 1.22], [69, 1.13999], [71, 1.04], [74, 0.93], [77, 0.86999], [78, 0.84], [80, 0],
];
const OWGR_REGULAR = [
  [1, 64.629], [2, 35.165], [3, 23.039], [4, 13.743], [7, 9.094], [9, 6.669],
  [14, 4.547], [18, 3.359], [23, 2.300], [30, 1.463], [38, 0.908], [49, 0.590],
  [53, 0.479], [55, 0.364], [60, 0.267], [62, 0.212], [64, 0],
];
const CHAMP_REGULAR = [
  [1, 500], [2, 300], [3, 190], [4, 135], [5, 110], [10, 75], [20, 45],
  [30, 28], [40, 16], [50, 8.5], [60, 5], [70, 3], [80, 2], [85, 1.5], [86, 0],
];
const CHAMP_SIGNATURE = [
  [1, 700], [2, 400], [3, 350], [5, 300], [10, 150], [20, 80], [30, 50],
  [50, 20], [70, 8], [85, 2], [86, 0],
];
const CHAMP_MAJOR = [
  [1, 750], [2, 500], [3, 350], [5, 300], [10, 175], [20, 90], [30, 55],
  [50, 22], [70, 9], [85, 2.5], [86, 0],
];

function pointsForRank(anchors, rank) {
  if (rank < anchors[0][0]) return anchors[0][1];
  for (let i = 0; i < anchors.length - 1; i++) {
    const [p0, v0] = anchors[i], [p1, v1] = anchors[i + 1];
    if (rank >= p0 && rank < p1) {
      const t = (rank - p0) / (p1 - p0);
      return Math.round((v0 + (v1 - v0) * t) * 1000) / 1000;
    }
  }
  return 0;
}

// Tied players split points the same way they'd split prize money: each
// player in a tied group gets the AVERAGE of the point values for every
// position the group occupies (e.g. two players tied for 3rd each get the
// average of the 3rd- and 4th-place values), not the value for a single
// arbitrarily-assigned rank. `sortedRows` must already be sorted ascending
// by `.total` — ties are detected by exact equality.
function pointsWithTies(sortedRows, table) {
  const out = new Array(sortedRows.length);
  let i = 0;
  while (i < sortedRows.length) {
    let j = i;
    while (j + 1 < sortedRows.length && sortedRows[j + 1].total === sortedRows[i].total) j++;
    let sum = 0;
    for (let rank = i + 1; rank <= j + 1; rank++) sum += pointsForRank(table, rank);
    const avg = sum / (j - i + 1);
    for (let k = i; k <= j; k++) out[k] = avg;
    i = j + 1;
  }
  return out;
}

// group: 'champ' (8 elevated + 3 postseason events) | 'players' | 'major'
function owgrTableFor(group) { return group === 'champ' ? OWGR_REGULAR : OWGR_MAJOR; }
function champTableFor(group) {
  if (group === 'champ') return CHAMP_SIGNATURE;
  if (group === 'major') return CHAMP_MAJOR;
  return CHAMP_MAJOR; // 'players' — treated at major weight, real FedEx points for THE PLAYERS sit at that tier
}

// Real current OWGR average-points, ranks 1-30 exact (owgr.com/current-world-ranking,
// Aug 2026 snapshot). Every one of these 30 players starts from their actual
// number, not an approximation.
const REAL_TOP30_OWGR = [
  17.57, 9.09, 7.91, 7.10, 6.64, 5.61, 5.51, 5.49, 5.43, 5.28,
  5.27, 4.87, 4.84, 4.76, 4.65, 4.42, 4.39, 4.19, 4.10, 4.09,
  3.91, 3.90, 3.87, 3.77, 3.77, 3.68, 3.62, 3.39, 3.37, 3.35,
];
// Beyond rank 30 we don't have individually-scraped figures for all 292
// players, so the tail is a power-law fit calibrated through two real,
// confirmed points: rank 30 (3.35, above) and rank 200 (0.75).
const TAIL_B = Math.log(3.35 / 0.75) / Math.log(200 / 30);
const TAIL_A = 3.35 * Math.pow(30, TAIL_B);
function realWorldOwgr(rank) {
  if (rank <= 30) return REAL_TOP30_OWGR[rank - 1];
  const v = TAIL_A * Math.pow(rank, -TAIL_B);
  return Math.round(v * 10000) / 10000;
}

// Cut sizes (place + ties) applied after round 2. Anything not listed here
// (the 11 Championship Series events) uses the default of 65.
const CUT_SIZES = { masters: 50, usopen: 60, open: 60, players: 70 };
function cutSizeFor(key) { return CUT_SIZES[key] || 65; }

// Dice — used only to seed the two demo results server-side; the client
// Dice tab has its own copy for rolling. Dice 1-3 are 100-sided, die 4 is
// 200-sided.
const DICE = [
  { id: 'd1', faces: { eagle: 1, birdie: 13, par: 72, bogey: 13, doubleBogey: 1 } },
  { id: 'd2', faces: { eagle: 2, birdie: 22, par: 66, bogey: 9, doubleBogey: 1 } },
  { id: 'd3', faces: { eagle: 1, birdie: 10, par: 64, bogey: 23, doubleBogey: 2 } },
  { id: 'd4', faces: { eagle: 1, birdie: 19, par: 120, bogey: 55, doubleBogey: 4, tripleBogey: 1 } },
];
const FACE_TO_STROKES = { eagle: -2, birdie: -1, par: 0, bogey: 1, doubleBogey: 2, tripleBogey: 3 };
function dieBag(die) {
  const bag = [];
  Object.entries(die.faces).forEach(([f, c]) => { for (let i = 0; i < c; i++) bag.push(f); });
  return bag;
}
const DICE_BAGS = DICE.map(dieBag);

// Returns the 18 individual hole results (to-par), so seeded rounds are
// stored the same shape as a hand-entered round — a 2028 aggregate wouldn't
// tell the story of any specific hole.
function simulateRoundHoles(rng) {
  const holes = new Array(18);
  for (let h = 0; h < 18; h++) {
    const bag = DICE_BAGS[Math.floor(rng() * DICE_BAGS.length)];
    const face = bag[Math.floor(rng() * bag.length)];
    holes[h] = FACE_TO_STROKES[face];
  }
  return holes;
}
function simulateRoundScore(rng) {
  return simulateRoundHoles(rng).reduce((a, b) => a + b, 0);
}

module.exports = {
  OWGR_MAJOR, OWGR_REGULAR, CHAMP_REGULAR, CHAMP_SIGNATURE, CHAMP_MAJOR,
  pointsForRank, pointsWithTies, owgrTableFor, champTableFor, realWorldOwgr,
  simulateRoundScore, simulateRoundHoles, DICE,
  CUT_SIZES, cutSizeFor,
};
