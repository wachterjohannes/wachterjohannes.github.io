---
title: "A security release announced before its details"
description: "The PHP security team announced on php.internals that a release on Wednesday, October 21 at 14:00 UTC fixes two critical vulnerabilities, both rated CVSS 4.0 9.2. It says nothing about what they are, and it reserves the right to release earlier if details leak or exploitation shows up."
pubDate: 2026-10-21
tags: [php, security, open-source]
source: "https://news-web.php.net/php.internals/132883"
lang: en
---

The PHP security team announced on php.internals that a release on Wednesday, October 21 at 14:00 UTC fixes two critical vulnerabilities, both rated CVSS 4.0 9.2. It says nothing about what they are, and it reserves the right to release earlier if details leak or exploitation shows up. What interests me is that the only thing you can prepare is the update path itself. For me that is less obvious than "run apt upgrade", because PHP often sits inside a container image or a FrankenPHP binary, so the question is who rebuilds it and how fast. I won't know whether that was enough preparation until I see what the two bugs are.
