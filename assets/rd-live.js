/* rd-live.js - the recall bench for learn-reading-with-phoebe (session 4)
 *
 * Two parts, both computed in this browser.
 *
 * PART 1, MEASURED ON YOU. Three short public-domain passages (rd-passages.js, Project
 *   Gutenberg). You read one per condition, the page times you, hides the text and asks five
 *   questions. Words per minute = the passage's word count / your reading time in minutes.
 *   Comprehension = correct answers / 5. Effective rate = words per minute x comprehension.
 *   Conditions: normal pace; skim at double pace (the text disappears at half the time your
 *   normal-pace rate would need); read with three questions first. Results stay in this
 *   browser (localStorage) and nowhere else.
 *
 * PART 2, MODELLED, and labelled so on the widget. 20 facts, each with a starting memory
 *   stability S0 (days), spread evenly on a log scale from easy to hard. Recall probability
 *   after t days is R = exp(-t / S), the exponential forgetting family (Settles and Meeder 2016,
 *   half-life regression, use the same shape in base 2; the current FSRS scheduler uses a power
 *   law instead, because it fits real review data better). Each review changes S:
 *     reread     S' = S * (1 + GR * (1 - R)) + CR                      (always)
 *     retrieve   success with probability R: S' = S * (1 + GT * (1 - R)) + CT
 *                failure  with probability 1-R: S' = max(S0, S) + CR (you see the answer)
 *   so a review when R is still near 1 (straight after reading) adds little, and a review after
 *   some forgetting adds more. Day-30 recall is the exact expectation over every success /
 *   failure path, averaged over the 20 facts. Parameters are illustrative, not fitted to anyone;
 *   the ordering of schedules is the claim, not the percentages.
 *
 * materials/rd_reference.py implements the same model independently and must print the same
 * numbers to 0.1 percentage point (materials/rd-node.js runs this file headless).
 */
(function (root) {
  "use strict";

  /* ---------- the model (mirrors materials/rd_reference.py) ---------- */
  var P = { N: 20, S_MED: 5.0, SPREAD: 0.7, GT: 4.0, GR: 1.0, CT: 2.0, CR: 2.0, GAP_MIN: 10, T: 30,
            READ_MIN: 10, REREAD_MIN: 10, TEST_MIN: 5 };

  function stabilities() {
    var out = [];
    for (var i = 0; i < P.N; i++) out.push(P.S_MED * Math.exp(-P.SPREAD + 2 * P.SPREAD * i / (P.N - 1)));
    return out;
  }

  var PRESETS = [
    { id: "once", label: "Read it once", kind: "reread", days: [], note: "Read the chapter carefully tonight, then nothing." },
    { id: "reread3", label: "Reread three times tonight", kind: "reread", days: [0, 0, 0], note: "Three more passes straight after the first, ten minutes apart." },
    { id: "s137", label: "Retrieve on day 1, 3 and 7", kind: "test", days: [1, 3, 7], spaced: true, note: "Close the book and recall, then check. Five minutes each." },
    { id: "s1721", label: "Retrieve on day 1, 7 and 21", kind: "test", days: [1, 7, 21], spaced: true, note: "The same three retrievals, gaps that widen." },
    { id: "reread5", label: "Reread five times tonight", kind: "reread", days: [0, 0, 0, 0, 0], anti: true, note: "Anti-lever: the most minutes of any schedule, all in one sitting." },
    { id: "zero", label: "Break it: set every gap to zero", kind: "test", days: [1, 3, 7], spaced: true, brk: true, note: "The day 1/3/7 retrievals, done back to back tonight." }
  ];
  function preset(id) { for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i].id === id) return PRESETS[i]; return null; }

  /* event times in days: massed reviews sit GAP_MIN minutes apart; spaced days are scaled */
  function eventTimes(pr, scale) {
    var m = P.GAP_MIN / 1440, out = [];
    var sc = pr.brk ? 0 : (pr.spaced ? scale : 1);
    for (var k = 0; k < pr.days.length; k++) out.push(Math.max((k + 1) * m, sc * pr.days[k]));
    return out;
  }

  function factStates(s0, kind, times, until) {
    var st = [[1.0, s0, 0.0]];
    for (var e = 0; e < times.length; e++) {
      var d = times[e];
      if (d > until) break;
      var nx = [];
      for (var j = 0; j < st.length; j++) {
        var p = st[j][0], S = st[j][1], last = st[j][2];
        var R = Math.exp(-(d - last) / S);
        if (kind === "reread") nx.push([p, S * (1 + P.GR * (1 - R)) + P.CR, d]);
        else {
          nx.push([p * R, S * (1 + P.GT * (1 - R)) + P.CT, d]);
          nx.push([p * (1 - R), Math.max(s0, S) + P.CR, d]);
        }
      }
      st = nx;
    }
    return st;
  }

  /* mean recall (0-1) across the 20 facts at day t */
  function recallAt(pr, scale, t) {
    var ss = stabilities(), times = eventTimes(pr, scale), tot = 0;
    for (var i = 0; i < ss.length; i++) {
      var st = factStates(ss[i], pr.kind, times, t), r = 0;
      for (var j = 0; j < st.length; j++) r += st[j][0] * Math.exp(-(t - st[j][2]) / st[j][1]);
      tot += r;
    }
    return tot / ss.length;
  }

  function minutes(pr) {
    return P.READ_MIN + pr.days.length * (pr.kind === "reread" ? P.REREAD_MIN : P.TEST_MIN);
  }

  function runPreset(id, scale) {
    var pr = preset(id);
    if (scale === undefined || scale === null) scale = 1;
    return { id: id, day30: 100 * recallAt(pr, scale, P.T), day14: 100 * recallAt(pr, scale, 14),
             minutes: minutes(pr), times: eventTimes(pr, scale) };
  }

  function curve(id, scale) {
    var pr = preset(id), pts = [];
    for (var t = 0; t <= P.T + 1e-9; t += 0.5) pts.push([t, 100 * recallAt(pr, scale, t)]);
    return pts;
  }

  /* ---------- the learner measures ---------- */
  function wordCount(text) { return text.trim().split(/\s+/).length; }
  function wpm(words, ms) { return ms > 0 ? words / (ms / 60000) : 0; }
  function score(answers, qs) {
    var c = 0;
    for (var i = 0; i < qs.length; i++) if (answers[i] === qs[i].a) c++;
    return c;
  }
  var CONDITIONS = [
    { id: "normal", label: "Normal pace", note: "Read the way you usually read to understand. The clock runs until you press Done." },
    { id: "skim", label: "Skim at double pace", note: "The text disappears at half the time your normal-pace rate would need for it." },
    { id: "preq", label: "Three questions first", note: "You see three of the five questions before the text. Then read at your own pace." }
  ];
  /* rotation r assigns passage (c + r) % 3 to condition c, so any passage can sit in any condition */
  function passageFor(cond, rot, n) { return (cond + rot) % n; }

  var api = { P: P, PRESETS: PRESETS, runPreset: runPreset, recallAt: recallAt, curve: curve,
              stabilities: stabilities, eventTimes: eventTimes, minutes: minutes,
              wordCount: wordCount, wpm: wpm, score: score, CONDITIONS: CONDITIONS, passageFor: passageFor };
  root.RD = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;

  /* ---------- UI helpers ---------- */
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function f1(x) { return (Math.round(x * 10) / 10).toFixed(1); }
  var STORE = "lwp-reading-bench:v1";
  function load() { try { return JSON.parse(localStorage.getItem(STORE) || "{}"); } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(STORE, JSON.stringify(o)); } catch (e) {} }

  /* ---------- PART 1 UI: measured on you ---------- */
  function mountLearner(host) {
    var PS = root.RD_PASSAGES || [];
    if (!PS.length) { host.textContent = "Passages did not load."; return; }
    var state = load();
    if (typeof state.rot !== "number") state.rot = 0;
    if (!state.res) state.res = {};
    var run = null, timer = null;

    host.innerHTML = "";
    var head = el("div", "mb-wrap");
    head.appendChild(el("h4", "", 'Part 1 · measured on you <span class="mb-mkind is-measured">measured</span>'));
    head.appendChild(el("p", "mb-intro", "Three trials, one passage each. The clock is real and the score is yours. Results stay in this browser only. A five-question check is a coarse instrument: one question is 20 points, so read a difference of 20 as noise, not a finding."));
    var rotRow = el("div", "ab-pick rd-rot");
    rotRow.innerHTML = '<label for="rd-rot">Passage order</label>';
    var sel = el("select"); sel.id = "rd-rot";
    for (var r = 0; r < 3; r++) {
      var o = el("option"); o.value = r;
      o.textContent = CONDITIONS.map(function (c, ci) { return PS[passageFor(ci, r, PS.length)].author.split(" ").pop(); }).join(" / ");
      sel.appendChild(o);
    }
    sel.value = state.rot;
    rotRow.appendChild(sel);
    head.appendChild(rotRow);
    var trials = el("div", "rd-trials");
    head.appendChild(trials);
    var stage = el("div", "rd-stage");
    head.appendChild(stage);
    var resWrap = el("div", "rd-results");
    head.appendChild(resWrap);
    host.appendChild(head);

    sel.addEventListener("change", function () {
      state.rot = +sel.value; state.res = {}; save(state); stop(); drawTrials(); drawResults();
    });

    function stop() { if (timer) { clearInterval(timer); timer = null; } run = null; stage.innerHTML = ""; }

    function drawTrials() {
      trials.innerHTML = "";
      CONDITIONS.forEach(function (c, ci) {
        var p = PS[passageFor(ci, state.rot, PS.length)];
        var done = state.res[c.id];
        var card = el("div", "rd-trial" + (done ? " is-done" : ""));
        card.innerHTML = '<span class="rd-tnum">Trial ' + (ci + 1) + '</span><b>' + esc(c.label) + '</b>' +
          '<span class="rd-tnote">' + esc(c.note) + '</span>' +
          '<span class="rd-tsrc">' + esc(p.author) + ', ' + esc(p.book) + ' · ' + p.words + ' words</span>';
        var b = el("button", "btn" + (done ? "" : " primary"), done ? "Run again" : "Start trial " + (ci + 1));
        b.type = "button"; b.id = "rd-start-" + c.id;
        var locked = ci === 1 && !state.res.normal;
        if (locked) { b.disabled = true; b.textContent = "Needs trial 1 first"; }
        b.addEventListener("click", function () { start(ci); });
        card.appendChild(b);
        trials.appendChild(card);
      });
    }

    function start(ci) {
      stop();
      var c = CONDITIONS[ci], p = PS[passageFor(ci, state.rot, PS.length)];
      run = { ci: ci, c: c, p: p, t0: 0, ms: 0, limit: 0 };
      stage.innerHTML = "";
      if (c.id === "preq") {
        var pre = el("div", "rd-pre");
        pre.innerHTML = "<b>Your three questions. Read them, then start the clock.</b><ol>" +
          p.questions.slice(0, 3).map(function (q) { return "<li>" + esc(q.q) + "</li>"; }).join("") + "</ol>";
        var go = el("button", "btn primary", "Start the clock"); go.type = "button"; go.id = "rd-go";
        go.addEventListener("click", function () { showText(); });
        pre.appendChild(go);
        stage.appendChild(pre);
      } else showText();
    }

    function showText() {
      var c = run.c, p = run.p;
      stage.innerHTML = "";
      var bar = null;
      if (c.id === "skim") {
        var nw = state.res.normal.wpm;
        run.limit = 60000 * p.words / (2 * nw);
        var lab = el("div", "rd-limit", "Double your normal pace: " + Math.round(2 * nw) + " words per minute, " + f1(run.limit / 1000) + " seconds for this passage.");
        stage.appendChild(lab);
        bar = el("div", "rd-bar"); bar.appendChild(el("i"));
        stage.appendChild(bar);
      }
      var box = el("div", "rd-text");
      box.textContent = p.text;
      stage.appendChild(box);
      var done = el("button", "btn primary", "Done reading"); done.type = "button"; done.id = "rd-done";
      stage.appendChild(done);
      stage.appendChild(el("p", "rd-cite", "From " + esc(p.book) + " by " + esc(p.author) + " (" + esc(p.year) + "), public domain in the US; source text found at <a href=\"" + p.source + "\">" + p.source.replace("https://", "") + "</a>. Line breaks joined, footnote marks and long dashes removed."));
      run.t0 = performance.now();
      done.addEventListener("click", function () { finishReading(); });
      if (run.limit) {
        timer = setInterval(function () {
          var e = performance.now() - run.t0;
          if (bar) bar.firstChild.style.width = Math.min(100, 100 * e / run.limit) + "%";
          if (e >= run.limit) finishReading();
        }, 100);
      }
      if (box.scrollIntoView) box.scrollIntoView({ block: "nearest" });
    }

    function finishReading(msOverride) {
      if (!run || run.ms) return;
      if (timer) { clearInterval(timer); timer = null; }
      var e = typeof msOverride === "number" ? msOverride : performance.now() - run.t0;
      run.ms = run.limit ? Math.min(e, run.limit) : e;
      var p = run.p;
      stage.innerHTML = "";
      var form = el("div", "rd-quiz");
      form.appendChild(el("p", "rd-qhead", "<b>The text is gone.</b> Five questions; pick one answer each."));
      p.questions.forEach(function (q, qi) {
        var f = el("fieldset", "rd-q");
        f.appendChild(el("legend", "", (qi + 1) + " · " + esc(q.q)));
        q.o.forEach(function (opt, oi) {
          var l = el("label");
          l.innerHTML = '<input type="radio" name="rd-q' + qi + '" value="' + oi + '"> ' + String.fromCharCode(65 + oi) + " · " + esc(opt);
          f.appendChild(l);
        });
        form.appendChild(f);
      });
      var sub = el("button", "btn primary", "Check my answers"); sub.type = "button"; sub.id = "rd-submit";
      sub.addEventListener("click", function () {
        var ans = p.questions.map(function (q, qi) {
          var x = form.querySelector('input[name="rd-q' + qi + '"]:checked');
          return x ? +x.value : -1;
        });
        record(ans);
      });
      form.appendChild(sub);
      stage.appendChild(form);
    }

    function record(ans) {
      var p = run.p, c = run.c;
      var sc = score(ans, p.questions);
      var w = wpm(p.words, run.ms);
      var res = { wpm: w, correct: sc, comp: sc / 5, eff: w * sc / 5, words: p.words, ms: run.ms, passage: p.id };
      if (c.id === "preq") {
        res.preCorrect = score(ans.slice(0, 3), p.questions.slice(0, 3));
        res.otherCorrect = sc - res.preCorrect;
      }
      state.res[c.id] = res;
      save(state);
      stop();
      drawTrials();
      drawResults();
    }

    function drawResults() {
      var R = state.res, keys = CONDITIONS.filter(function (c) { return R[c.id]; });
      if (!keys.length) { resWrap.innerHTML = '<p class="rd-empty">No trials yet. Start with trial 1.</p>'; return; }
      var h = '<div class="rd-tablewrap"><table class="clean rd-table"><thead><tr><th>Condition</th><th>Words per minute</th><th>Correct</th><th>Effective rate</th></tr></thead><tbody>';
      keys.forEach(function (c) {
        var x = R[c.id];
        h += "<tr><td>" + esc(c.label) + "</td><td>" + Math.round(x.wpm) + "</td><td>" + x.correct + " of 5</td><td>" + Math.round(x.eff) + "</td></tr>";
      });
      h += "</tbody></table></div>";
      var notes = [];
      if (R.normal && R.skim) {
        notes.push("Skimming: speed x" + f1(R.skim.wpm / R.normal.wpm) + ", correct answers " + R.normal.correct + " to " + R.skim.correct +
          ". Effective rate " + Math.round(R.normal.eff) + " to " + Math.round(R.skim.eff) + (R.skim.eff < R.normal.eff ? ": the speed cost you more understanding than it saved." : ": on this pair of passages the trade paid off; try another passage order."));
      }
      if (R.preq) notes.push("With questions first: " + R.preq.preCorrect + " of the 3 questions you saw, " + R.preq.otherCorrect + " of the 2 you did not.");
      h += notes.map(function (n) { return '<p class="mb-verdict is-ok rd-note">' + esc(n) + "</p>"; }).join("");
      h += scatter(R);
      h += '<button class="btn" type="button" id="rd-clear">Clear my results</button>';
      resWrap.innerHTML = h;
      document.getElementById("rd-clear").addEventListener("click", function () { state.res = {}; save(state); drawTrials(); drawResults(); });
    }

    function scatter(R) {
      var W = 520, H = 230, x0 = 60, x1 = 500, y0 = 190, y1 = 24, xmax = 1000;
      function X(v) { return x0 + (x1 - x0) * Math.min(v, xmax) / xmax; }
      function Y(v) { return y0 - (y0 - y1) * v; }
      var s = '<div class="ab-stage"><svg class="rd-sc" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Your three trials as dots: words per minute across, share of questions correct up.">';
      s += '<rect class="rd-band" x="' + X(175) + '" y="' + y1 + '" width="' + (X(300) - X(175)) + '" height="' + (y0 - y1) + '"/>';
      s += '<line class="ab-axis" x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + y0 + '"/><line class="ab-axis" x1="' + x0 + '" y1="' + y0 + '" x2="' + x0 + '" y2="' + y1 + '"/>';
      [0, 250, 500, 750, 1000].forEach(function (v) { s += '<text class="ab-tick" x="' + X(v) + '" y="' + (y0 + 16) + '" text-anchor="middle">' + v + '</text>'; });
      [0, 0.6, 1].forEach(function (v) { s += '<text class="ab-tick" x="' + (x0 - 8) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + Math.round(v * 100) + '%</text>'; });
      s += '<text class="ab-cap" x="' + ((x0 + x1) / 2) + '" y="' + (H - 4) + '" text-anchor="middle">words per minute</text>';
      s += '<text class="ab-cap" x="' + (X(175) + 4) + '" y="' + (y1 + 12) + '">most adults, 175-300</text>';
      CONDITIONS.forEach(function (c, ci) {
        var x = R[c.id]; if (!x) return;
        s += '<circle class="ab-dot' + (ci === 1 ? " is-sel" : "") + '" cx="' + X(x.wpm) + '" cy="' + Y(x.comp) + '" r="6"/>';
        s += '<text class="ab-lab" x="' + (X(x.wpm) + 10) + '" y="' + (Y(x.comp) + 4 - ci * 0) + '">' + (ci + 1) + '</text>';
      });
      return s + "</svg></div>";
    }

    drawTrials();
    drawResults();
    host._rd = { start: start, finish: finishReading, state: state };
  }

  /* ---------- PART 2 UI: modelled ---------- */
  function mountModel(host) {
    var state = { id: host.getAttribute("data-preset") || "s137", scale: 1 };
    host.innerHTML = "";
    var w = el("div", "mb-wrap");
    w.appendChild(el("h4", "", 'Part 2 · 20 facts over 30 days <span class="mb-mkind is-heuristic">modelled</span>'));
    w.appendChild(el("p", "mb-intro", "Modelled, not measured. Each fact fades as R = exp(-t / S), the exponential family of forgetting models; every review raises its stability S, by more when some forgetting has happened first. Settings are illustrative and fitted to nobody; only the ordering of the schedules is the claim."));
    var pres = el("div", "mb-presets");
    var btns = {};
    PRESETS.forEach(function (p) {
      var l = el("label", "mb-preset" + (p.anti || p.brk ? " is-anti" : ""));
      l.innerHTML = '<input type="radio" name="rd-preset" value="' + p.id + '"><span><span class="mb-pname">' + esc(p.label) + "</span>" +
        (p.anti ? ' <span class="mb-anti">anti-lever</span>' : "") + (p.brk ? ' <span class="mb-anti">break button</span>' : "") +
        '</span><span class="mb-pnote">' + esc(p.note) + "</span>";
      l.querySelector("input").addEventListener("change", function () { state.id = p.id; render(); });
      btns[p.id] = l; pres.appendChild(l);
    });
    w.appendChild(pres);
    var sc = el("div", "ab-caprow");
    sc.innerHTML = '<label for="rd-scale">Stretch the spaced gaps</label><input type="range" id="rd-scale" min="0" max="1.5" step="0.25" value="1"><output id="rd-scaleout">x1.00</output>';
    w.appendChild(sc);
    var verdict = el("p", "mb-verdict");
    w.appendChild(verdict);
    var metrics = el("div", "mb-metrics");
    w.appendChild(metrics);
    var chart = el("div", "ab-stage rd-chart");
    w.appendChild(chart);
    host.appendChild(w);
    var range = sc.querySelector("input"), out = sc.querySelector("output");
    range.addEventListener("input", function () { state.scale = +range.value; render(); });

    function metric(label, val, unit) {
      return '<div class="mb-metric"><span class="mb-mkind is-heuristic">modelled</span><span class="mb-mlabel">' + esc(label) +
        '</span><span class="mb-mvalue">' + esc(val) + '</span><span class="mb-munit">' + esc(unit) + "</span></div>";
    }

    function render() {
      var pr = preset(state.id);
      Object.keys(btns).forEach(function (k) { btns[k].classList.toggle("is-on", k === state.id); btns[k].querySelector("input").checked = k === state.id; });
      out.textContent = "x" + state.scale.toFixed(2);
      sc.style.opacity = pr.spaced && !pr.brk ? "1" : ".55";
      var r = runPreset(state.id, state.scale), once = runPreset("once"), rr = runPreset("reread3"), sp = runPreset("s137", state.scale);
      var v;
      if (pr.anti) v = "Anti-lever. Five rereads tonight: " + r.minutes + " minutes, day-30 recall " + f1(r.day30) + "%. Three spaced retrievals: " + sp.minutes + " minutes, " + f1(sp.day30) + "%.";
      else if (pr.brk) v = "Broken on purpose. The day 1/3/7 retrievals squeezed into tonight: day-30 recall " + f1(r.day30) + "%, against " + f1(rr.day30) + "% for three rereads. With no gap, the spacing advantage is gone.";
      else if (pr.id === "once") v = "Read once, no review: day-30 recall " + f1(r.day30) + "%.";
      else v = pr.label + ": day-30 recall " + f1(r.day30) + "% for " + r.minutes + " minutes, against " + f1(once.day30) + "% for reading once.";
      verdict.className = "mb-verdict " + (pr.anti || pr.brk ? "is-bad" : r.day30 > rr.day30 + 5 ? "is-good" : "is-ok");
      verdict.textContent = v;
      metrics.innerHTML =
        metric("Recall at day 30", f1(r.day30) + "%", "read once " + f1(once.day30) + "%") +
        metric("Recall at day 14", f1(r.day14) + "%", "read once " + f1(once.day14) + "%") +
        metric("Minutes spent", String(r.minutes), "first read 10 + reviews") +
        metric("Review times", r.times.length ? r.times.map(function (t) { return t < 0.05 ? "tonight" : "day " + (Math.round(t * 100) / 100); }).join(", ") : "none", "after the first read");
      chart.innerHTML = draw([{ id: "once", cls: "rd-c-once" }, { id: "reread3", cls: "rd-c-rr" }, { id: state.id, cls: "rd-c-sel" }]);
    }

    function draw(series) {
      var W = 620, H = 260, x0 = 54, x1 = 600, y0 = 210, y1 = 20;
      function X(t) { return x0 + (x1 - x0) * t / P.T; }
      function Y(v) { return y0 - (y0 - y1) * v / 100; }
      var s = '<svg class="rd-curve" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Modelled mean recall of 20 facts from day 0 to day 30 for the chosen schedule, against reading once and rereading three times.">';
      s += '<line class="ab-axis" x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + y0 + '"/><line class="ab-axis" x1="' + x0 + '" y1="' + y0 + '" x2="' + x0 + '" y2="' + y1 + '"/>';
      [0, 7, 14, 21, 30].forEach(function (t) { s += '<text class="ab-tick" x="' + X(t) + '" y="' + (y0 + 16) + '" text-anchor="middle">day ' + t + "</text>"; });
      [0, 50, 100].forEach(function (v) { s += '<text class="ab-tick" x="' + (x0 - 8) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + v + "%</text>"; });
      var seen = {};
      series.forEach(function (se) {
        if (seen[se.id]) return; seen[se.id] = 1;
        var pts = curve(se.id, state.scale);
        s += '<path class="rd-line ' + se.cls + '" d="' + pts.map(function (p, i) { return (i ? "L" : "M") + X(p[0]).toFixed(1) + " " + Y(p[1]).toFixed(1); }).join(" ") + '"/>';
      });
      s += '<text class="ab-cap" x="' + ((x0 + x1) / 2) + '" y="' + (H - 6) + '" text-anchor="middle">thick line: your chosen schedule · dashed: reread three times · thin: read once</text>';
      return s + "</svg>";
    }
    render();
    host._rd = { set: function (id, scale) { state.id = id; if (scale !== undefined) { state.scale = scale; range.value = scale; } render(); } };
  }

  function boot() {
    var a = document.getElementById("rd-learner"); if (a) mountLearner(a);
    var b = document.getElementById("rd-model"); if (b) mountModel(b);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})(typeof window !== "undefined" ? window : globalThis);
