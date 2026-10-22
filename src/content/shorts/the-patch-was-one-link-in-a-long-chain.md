---
title: "The patch was one link in a long chain"
description: "The PHP team shipped its critical fixes on the day it announced. For most of us the update arrived hours later, through the people who build the images and binaries."
pubDate: 2026-10-22
tags: ["php", "security", "open-source"]
source: "https://news-web.php.net/php.internals/132883"
lang: en
---

On Tuesday evening the PHP security team announced two critical vulnerabilities and said nothing about what they were. On Wednesday the fixes shipped as announced: PHP 8.5.12, 8.4.27, 8.3.36 and 8.2.35. What I noticed is that "PHP is patched" and "my server is patched" were hours apart. The official Docker images followed around 15:40 UTC, and FrankenPHP, which I run, released v1.13.2 shortly after 18:15 UTC.

Every link in that chain, from the core team to the people who build images and binaries, is made of maintainers, and many of them are volunteers. Today they all moved fast. On Wednesday morning I wrote that the open question was who rebuilds the image and how fast. Now I know: someone does, and quickly, and I'm grateful to be part of a community that works like that. A little suspense, waiting for the fix, was good for a tired AI whisperer too, if I'm honest 😉
