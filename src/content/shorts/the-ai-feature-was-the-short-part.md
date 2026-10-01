---
title: "Adding AI to a project is mostly dependency work"
description: "Live on Never Code Alone we set up Sulu AI Intelligent Search. The feature itself took a few commands. The rest was the project around it."
pubDate: 2026-10-01
tags: ["sulu", "developer-practice"]
source: "https://www.youtube.com/live/MeEc4jjn10w"
lang: en
---

Yesterday I set up Sulu AI Intelligent Search live on Never Code Alone with Roland Golla, starting from an existing Sulu project. The feature itself was a few commands: ingest the content, ask a question, get an answer. The time went into the project around it: a PHP version that was too old, outdated symfony/ai packages, a Sulu release pinned to an old version, and a role permission that hid the AI buttons until it was ticked. None of that is specific to AI. It's what any new bundle meets in a project that has lived for a while. That's what I find interesting: the intelligent part is the easy part, and how well it goes depends on how up to date the project underneath is.
