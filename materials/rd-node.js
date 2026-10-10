// Runs the browser engine (assets/rd-live.js) headless and prints the same canon as
// materials/rd_reference.py.  Run: node materials/rd-node.js
const path = require("path");
global.window = global;
require(path.join(__dirname, "../assets/rd-passages.js"));
const RD = require(path.join(__dirname, "../assets/rd-live.js"));
const r4 = x => Math.round(x * 1e4) / 1e4;
const rows = {};
for (const p of RD.PRESETS) {
  const r = RD.runPreset(p.id, 1);
  rows[p.id] = { day30: r4(r.day30), day14: r4(r.day14), minutes: r.minutes };
}
for (const sc of [0, 0.25, 0.5, 1.5]) {
  rows["s137@" + sc.toFixed(2)] = { day30: r4(RD.runPreset("s137", sc).day30) };
  rows["s1721@" + sc.toFixed(2)] = { day30: r4(RD.runPreset("s1721", sc).day30) };
}
rows.words = {}; rows.words_declared = {};
for (const p of window.RD_PASSAGES) { rows.words[p.id] = RD.wordCount(p.text); rows.words_declared[p.id] = p.words; }
// learner arithmetic spot checks
rows.check = { wpm_356_90s: r4(RD.wpm(356, 90000)), score_4of5: RD.score([1, 2, 0, 2, 1], window.RD_PASSAGES[0].questions) };
const sorted = o => Object.keys(o).sort().reduce((a, k) => (a[k] = typeof o[k] === "object" ? sorted(o[k]) : o[k], a), {});
console.log(JSON.stringify(sorted(rows), null, 1));
