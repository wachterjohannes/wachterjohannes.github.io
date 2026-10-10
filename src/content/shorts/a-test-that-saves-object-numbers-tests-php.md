---
title: "A test that saves object numbers tests PHP, not your code"
description: "One added line in a Symfony AI pull request broke 25 tests without any assertion changing. The tests were checking something nobody meant to check."
pubDate: 2026-10-10
tags: ["php", "testing", "symfony"]
source: "https://dev.to/mikibuilder/i-added-one-object-and-broke-25-tests-without-changing-a-single-assertion-11p"
lang: en
---

[Miguel Sampedro](https://github.com/MikiBuilder) added one line to a Symfony AI pull request and 25 tests failed, although not a single assertion had changed. The cause was in the saved expected results: they contained the internal numbers PHP gives to objects while it runs. Add one object and every number after it shifts, so every comparison breaks. Those tests were checking something nobody ever meant to check, the order in which PHP creates things. The fix was to stop saving those numbers. What I take from it: a test should only remember what I would defend in a review. Anything the machine makes up on its own is noise, and sooner or later it makes a harmless change look like a bug.
