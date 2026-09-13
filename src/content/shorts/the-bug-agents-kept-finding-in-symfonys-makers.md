---
title: "How I Made Symfony's Maker Agentic"
description: "Twelve merged pull requests in one release, my first-ever contribution to Symfony's maker-bundle. All of them were about the same thing: agents kept running into make:* commands that only worked with a human answering prompts, and simply crashed otherwise."
pubDate: 2026-09-13
tags: [symfony, php, ai-agents]
source: "https://github.com/symfony/maker-bundle/releases/tag/1.68.0"
lang: en
---

Twelve merged pull requests in one release, my first-ever contribution to Symfony's
maker-bundle. All of them were about the same thing: agents kept running into `make:*`
commands that only worked with a human answering prompts, and simply crashed otherwise.
`maker-bundle` 1.68.0 fixes eight of those commands and adds a short note for future maker
authors on how to avoid making the same mistake again. It closes a small, real gap behind an
argument I already made in my own `AGENTS.md` for Symfony's framework-bundle recipe: don't
just tell agents to work around what's broken, fix what's broken instead.
