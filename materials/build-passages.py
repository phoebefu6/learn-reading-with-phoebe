#!/usr/bin/env python3
"""Build assets/rd-passages.js for the recall bench (session 4).

Three short passages from US public-domain books on Project Gutenberg, fetched at source,
cut between two exact anchor strings, Gutenberg header and footer not included. Light
normalisation only: line breaks joined, footnote markers like [18] removed, and dashes
replaced with a comma or a hyphen (the pages carry no long dashes). The words are otherwise
the author's.

Licence note: these books are public domain in the United States. Project Gutenberg's
licence and trademark terms apply to its eBook files; quoting short public-domain passages
with the Gutenberg header and footer removed, and without using the Project Gutenberg name
as an endorsement, is what the licence page describes as permitted for public-domain works.
The source URL of each book is recorded in the data so the page can credit it.

Run:  python3 materials/build-passages.py   (from the repo root; needs network)
"""
import json
import re
import sys
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
OUT = REPO / "assets" / "rd-passages.js"

PASSAGES = [
    {
        "id": "franklin",
        "book": "Autobiography of Benjamin Franklin",
        "author": "Benjamin Franklin",
        "year": "written 1771-1790",
        "ebook": 20203,
        "start": "About this time I met with an odd volume of the",
        "end": "of which I was extremely ambitious.",
        "questions": [
            {"q": "What did Franklin do with his short hints before rewriting a paper?",
             "o": ["Rewrote it the same evening while the original was open",
                   "Laid them by a few days, then rewrote it without looking at the book",
                   "Read them aloud to his father",
                   "Copied the original out by hand three times"], "a": 1},
            {"q": "Which volume of the Spectator did he come across?",
             "o": ["The first", "The second", "The third", "The last"], "a": 2},
            {"q": "Why did he turn some of the tales into verse?",
             "o": ["To publish them as poems",
                   "To build a stock of words and a readiness in recalling them",
                   "Because his father asked him to",
                   "To shorten them"], "a": 1},
            {"q": "What was jumbling his collections of hints meant to teach him?",
             "o": ["Spelling", "Speed", "Method in the arrangement of thoughts", "Humility"], "a": 2},
            {"q": "How did he check his rewritten paper?",
             "o": ["He asked a friend to grade it",
                   "He compared it with the original and corrected his faults",
                   "He sent it to the Spectator",
                   "He did not check it"], "a": 1},
        ],
    },
    {
        "id": "darwin",
        "book": "The Voyage of the Beagle",
        "author": "Charles Darwin",
        "year": "1839, second edition 1845",
        "ebook": 944,
        "start": "I have not as yet noticed by far the most remarkable feature",
        "end": "belonged to M. melanotis.",
        "questions": [
            {"q": "Who first drew Darwin's attention to the islands having different inhabitants?",
             "o": ["Captain Porter", "M. Bibron", "The Vice-Governor, Mr. Lawson", "Mr. Gray"], "a": 2},
            {"q": "How far apart does Darwin say the islands are?",
             "o": ["About 5 or 6 miles", "About 50 or 60 miles", "About 500 miles", "He does not say"], "a": 1},
            {"q": "The shells of tortoises from Charles and Hood Island are compared to what?",
             "o": ["A Spanish saddle", "A shield", "A dome", "A bowl"], "a": 0},
            {"q": "Which specimens first thoroughly aroused his attention?",
             "o": ["The tortoises", "The finches", "The mocking-thrushes", "The marine lizards"], "a": 2},
            {"q": "What mistake does Darwin admit to?",
             "o": ["Losing his notebooks",
                   "Partially mingling the collections from two islands",
                   "Naming the wrong island",
                   "Eating the specimens"], "a": 1},
        ],
    },
    {
        "id": "faraday",
        "book": "The Chemical History of a Candle",
        "author": "Michael Faraday",
        "year": "lectures of 1848, published 1861",
        "ebook": 14474,
        "start": "You see, then, in the first instance, that a beautiful cup is formed.",
        "end": "and you will in the course of time find\nout the reason.",
        "questions": [
            {"q": "What keeps the outside edge of the candle cooler than the part within?",
             "o": ["The wick", "The ascending current of air", "The lamp-glass", "The cold wax"], "a": 1},
            {"q": "What happens if the cup is not horizontal?",
             "o": ["The flame goes out", "The fluid runs away in guttering",
                   "The wick burns faster", "Nothing changes"], "a": 1},
            {"q": "Which fuel does Faraday name as working without forming a cup?",
             "o": ["Bees-wax", "Tallow", "Irish bogwood", "Spermaceti"], "a": 2},
            {"q": "What does Faraday call the better point of beauty in a process?",
             "o": ["Its colour", "Its rarity", "Its utility, the best acting thing", "Its age"], "a": 2},
            {"q": "What should you ask whenever a new result happens?",
             "o": ["Who saw it?", "What is the cause? Why does it occur?",
                   "Can it be sold?", "Has it happened before?"], "a": 1},
        ],
    },
]


def fetch(n):
    url = "https://www.gutenberg.org/cache/epub/%d/pg%d.txt" % (n, n)
    with urllib.request.urlopen(url, timeout=60) as r:
        return r.read().decode("utf-8").replace("\r", "")


def norm(s):
    s = re.sub(r"\[\d+\]", "", s)                 # footnote markers
    s = s.replace(",\u2014", ", ").replace("\u2014", ", ")
    s = s.replace("\u2013", "-")
    s = re.sub(r"_([^_]+)_", r"\1", s)             # Gutenberg italics markers
    s = re.sub(r"\s+", " ", s).strip()
    s = s.replace(" ,", ",").replace(",,", ",")
    return s


def words(s):
    return len(s.split())


def main():
    out = []
    for p in PASSAGES:
        raw = fetch(p["ebook"])
        i = raw.find(p["start"])
        j = raw.find(p["end"], i)
        if i < 0 or j < 0:
            sys.exit("anchor not found in ebook %d" % p["ebook"])
        text = norm(raw[i:j + len(p["end"])])
        assert "\u2014" not in text and "\u2013" not in text
        q = p["questions"]
        assert len(q) == 5 and all(len(x["o"]) == 4 for x in q)
        out.append({
            "id": p["id"], "book": p["book"], "author": p["author"], "year": p["year"],
            "source": "https://www.gutenberg.org/ebooks/%d" % p["ebook"],
            "text": text, "words": words(text), "questions": q,
        })
        print("%-8s %4d words  ebook #%d" % (p["id"], words(text), p["ebook"]))
    js = ("/* rd-passages.js - generated by materials/build-passages.py with json.dumps. Do not edit.\n"
          " * Three public-domain passages (Project Gutenberg, header and footer removed) and five\n"
          " * comprehension questions each, for the recall bench. */\n"
          "window.RD_PASSAGES = " + json.dumps(out, ensure_ascii=True, indent=1) + ";\n")
    OUT.write_text(js)
    print("wrote", OUT, len(js), "bytes")


if __name__ == "__main__":
    main()
