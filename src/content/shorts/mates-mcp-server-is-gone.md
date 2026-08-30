---
title: "Mate's MCP server is gone, and the numbers say that's fine"
description: "symfony/ai 0.13 shipped today, my first release as a core team member. The headline change for Mate is PR #2380: Mate drops its MCP server entirely and becomes a plain CLI with a discovery layer on top."
pubDate: 2026-08-29
tags: [symfony, ai, mate]
source: "https://github.com/symfony/ai/pull/2380"
lang: en
---

symfony/ai 0.13 shipped today, my first release as a core team member. The headline change
for Mate is PR #2380: Mate drops its MCP server entirely and becomes a plain CLI with a discovery
layer on top. That change only became practical because Mate's skill lifecycle, started
in 0.12 and reworked here, lets skills be discovered, installed and kept as part of the
project's agent context instead of just existing somewhere in a package. In a controlled
test, the bare CLI
was invoked 0 times in 30 runs. It was installed and working, but nothing told the agent it
existed. Add the file-based discovery layer and five new skills, and the resulting setup
performed about as well as the old MCP server. The transport wasn't what decided whether
Mate worked. Whether the agent could discover the right command was.
