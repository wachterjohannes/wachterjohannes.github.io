---
title: "A Rector extension for Symfony Mate"
description: "The new Rector extension for Symfony Mate splits one tool into two: rector-preview runs dry-run enforced and cannot write, rector-apply is a separate tool that announces itself as a write operation. Inspecting code is never the thing that changes it. Contributed by mdjdev, not by me."
pubDate: 2026-08-18
tags: [mate, php, ai]
source: https://packagist.org/packages/matesofmate/rector-extension
lang: en
---

The new Rector extension for Symfony Mate splits one tool into two, and the split is the whole
point. `rector-preview` runs with `--dry-run` enforced and cannot write, and its description
says so in the one place the agent actually reads. Changing files means reaching for
`rector-apply`, a separate tool that announces itself as a write operation, so inspecting code
is never the thing that changes it. Rector still decides the refactoring, the same way every
time, which is the part I am comfortable letting an agent reach for. It was contributed by
mdjdev rather than by me, and that is the part of MatesOfMate that was always the point.
