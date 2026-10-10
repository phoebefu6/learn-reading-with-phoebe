#!/usr/bin/env python3
"""Independent reference for the recall bench model (assets/rd-live.js, part 2).

Exponential forgetting R = exp(-t/S) with a stability S that grows on each review. Exact
expectation over every retrieval success / failure path, mean over 20 facts. Parameters are
illustrative. Prints the canon the session pages quote; materials/rd-node.js prints the same
from the browser engine and the two must agree to 0.1 percentage point.

Also re-counts the words in assets/rd-passages.js so the words-per-minute denominators match.
Run: python3 materials/rd_reference.py
"""
import json
import math
import re
from pathlib import Path

N, S_MED, SPREAD = 20, 5.0, 0.7
GT, GR, CT, CR = 4.0, 1.0, 2.0, 2.0
GAP = 10 / 1440
T = 30
MIN_READ, MIN_REREAD, MIN_TEST = 10, 10, 5

PRESETS = {
    "once":    ("reread", [], False, False),
    "reread3": ("reread", [0, 0, 0], False, False),
    "s137":    ("test", [1, 3, 7], True, False),
    "s1721":   ("test", [1, 7, 21], True, False),
    "reread5": ("reread", [0] * 5, False, False),
    "zero":    ("test", [1, 3, 7], True, True),
}


def stabilities():
    return [S_MED * math.exp(-SPREAD + 2 * SPREAD * i / (N - 1)) for i in range(N)]


def times(pid, scale=1.0):
    kind, days, spaced, brk = PRESETS[pid]
    sc = 0.0 if brk else (scale if spaced else 1.0)
    return [max((k + 1) * GAP, sc * d) for k, d in enumerate(days)]


def recall(pid, t, scale=1.0):
    kind = PRESETS[pid][0]
    ev = times(pid, scale)
    total = 0.0
    for s0 in stabilities():
        paths = [(1.0, s0, 0.0)]
        for d in ev:
            if d > t:
                break
            nxt = []
            for p, S, last in paths:
                R = math.exp(-(d - last) / S)
                if kind == "reread":
                    nxt.append((p, S * (1 + GR * (1 - R)) + CR, d))
                else:
                    nxt.append((p * R, S * (1 + GT * (1 - R)) + CT, d))
                    nxt.append((p * (1 - R), max(s0, S) + CR, d))
            paths = nxt
        total += sum(p * math.exp(-(t - last) / S) for p, S, last in paths)
    return 100 * total / N


def minutes(pid):
    kind, days, _, _ = PRESETS[pid]
    return MIN_READ + len(days) * (MIN_REREAD if kind == "reread" else MIN_TEST)


def main():
    rows = {}
    for pid in PRESETS:
        rows[pid] = {"day30": round(recall(pid, 30), 4), "day14": round(recall(pid, 14), 4), "minutes": minutes(pid)}
    for sc in (0.0, 0.25, 0.5, 1.5):
        rows["s137@%.2f" % sc] = {"day30": round(recall("s137", 30, sc), 4)}
        rows["s1721@%.2f" % sc] = {"day30": round(recall("s1721", 30, sc), 4)}
    js = (Path(__file__).resolve().parent.parent / "assets" / "rd-passages.js").read_text()
    data = json.loads(re.search(r"window\.RD_PASSAGES = (.*);\s*$", js, re.S).group(1))
    rows["words"] = {p["id"]: len(p["text"].split()) for p in data}
    rows["words_declared"] = {p["id"]: p["words"] for p in data}
    print(json.dumps(rows, indent=1, sort_keys=True))


if __name__ == "__main__":
    main()
