---
title: "Claude Code now falls back to AGENTS.md"
description: "Claude Code 2.1.277 now checks for an AGENTS.md file whenever a folder has no CLAUDE.md (there's a toggle for it in /config)."
pubDate: 2026-09-23
tags: [ai, agentic-ai, symfony]
source: "https://x.com/trq212/status/2101009392611278961"
lang: en
---

Claude Code 2.1.277 now checks for an AGENTS.md file whenever a folder has no CLAUDE.md (there's a toggle for it in /config). The detail that matters isn't the new file format, it's the fallback: check for AGENTS.md only once CLAUDE.md is missing, not a second file everyone now has to keep alongside the first. That's the design a shared convention actually needs to spread instead of splintering into per-tool variants. I wrote an AGENTS.md for Symfony's framework-bundle recipe before this shipped. That same PR also added a CLAUDE.md that did nothing but point to AGENTS.md, a workaround for agents that hadn't caught up yet. Now that Claude Code reads AGENTS.md directly, that stub file is probably safe to remove.
