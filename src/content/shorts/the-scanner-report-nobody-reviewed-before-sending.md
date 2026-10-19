---
title: "The scanner report nobody reviewed before sending"
description: "Anthropic's new Cyber Mission includes a free OSS Scanner: enrolled open source projects get periodic scans, with a proof of concept and a suggested fix per finding. What caught my attention is a sentence in the announcement itself."
pubDate: 2026-10-19
tags: [open-source, security, agentic-ai]
source: "https://www.anthropic.com/news/anthropic-cyber-mission"
lang: en
---

Anthropic's new Cyber Mission includes a free OSS Scanner: enrolled open source projects get periodic scans, with a proof of concept and a suggested fix per finding. What caught my attention is a sentence in the announcement itself. The reports are model-generated and sent without human review, so some may be wrong, and the expected true-positive rate above 90% is a projection, not a measurement. Anthropic also writes that finding vulnerabilities has become easy while verifying and fixing them still depends on people. I think that is the real shift: the cost of a claim drops to almost zero, and the cost of checking it stays with the maintainer. Opt-in is a sensible start, and I have just opted Sulu in myself ([PR #597](https://github.com/anthropics/oss-scanner/pull/597)). Getting in is the part with people in the loop: a checklist, a CLA, an automated triage comment built from public data, and a case-by-case decision. The real work was the Dockerfile, because the image has to build the project and run its tests offline. With MariaDB and a few PHP extensions added, the suite passes, except one media test that needs the network. Whatever arrives afterwards will be the reverse: fast to produce, slow to read. If reports do come, I would like to count the minutes each one takes me.
