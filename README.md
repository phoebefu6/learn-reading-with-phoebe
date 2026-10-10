# Learn Reading with Phoebe

Six 45-minute sessions on reading and remembering what you read, on the evidence: what a
words-per-minute number really measures and why comprehension caps it, choosing what to read and
how deeply, why rereading and highlighting feel like learning when retrieval is what works, a
recall bench that measures the learner, spacing reviews so forgetting is planned for, and reading
papers, documentation and charts in the right order. The running case is constructed: an analyst
at an invented shipping company with a week of reading before a vendor decision.

**Live site:** https://phoebefu6.github.io/learn-reading-with-phoebe/

| # | Session | Signature thing |
|---|---|---|
| 1 | What reading speed really measures | 238 wpm silent non-fiction (Brysbaert 2019), not 300; the speed-comprehension trade-off |
| 2 | Reading with a question | Inspectional against analytical reading; a question before every text |
| 3 | Rereading feels like learning | The fluency illusion and Dunlosky et al.'s ten technique ratings |
| 4 | The recall bench | Your own speed and comprehension, measured; a declared forgetting model |
| 5 | Spacing, and the forgetting you can plan for | Cepeda et al.'s gap-follows-the-deadline result, turned into a calendar |
| 6 | Reading a paper, a doc and a chart | Keshav's three passes, task-first docs, axes-first charts |

The bench in session 4 has two parts, both computed in the browser (`assets/rd-live.js`).
Part 1 measures the learner: three public-domain passages (`assets/rd-passages.js`, built by
`materials/build-passages.py` from the plain-text files of Franklin's Autobiography, Darwin's
Voyage of the Beagle and Faraday's Chemical History of a Candle, found at gutenberg.org, header
removed) are timed and followed by five questions each, under normal pace, a double-pace skim and
questions first. Results stay in the browser's localStorage. Part 2 is a declared model: 20 facts
with exponential forgetting and a stability that grows on each review, illustrative settings, exact
expectation over retrieval success and failure. Day-30 recall: read once 1.0%, reread three times
tonight 7.6%, retrieve on day 1/3/7 46.5%, on day 1/7/21 72.8%. The anti-lever, reread five times
tonight, spends 60 minutes for 14.4%; the break button sets every gap to zero and lands on 7.7%.
The Python reference (`python3 materials/rd_reference.py`) and the browser engine
(`node materials/rd-node.js`) print identical numbers.

By Phoebe Fu.
