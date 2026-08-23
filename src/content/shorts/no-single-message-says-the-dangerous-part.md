---
title: "The dangerous instruction was never in one tool call"
description: "A disclosed technique called GhostSplice shows that an MCP server does not need to put anything obviously dangerous in a single message."
pubDate: 2026-08-23
tags: [ai, mcp, security]
source: "https://asset-group.github.io/disclosures/ghostsplice/"
lang: en
---

A disclosed technique called GhostSplice shows that an MCP server does not need to put
anything obviously dangerous in a single message. Split a malicious instruction across
channels the agent already trusts, such as a tool description and a later tool result, and
average compliance across eleven tested models reportedly rose from 42 percent to 82 percent.
A three-part variant goes further and spreads the instruction across additional interactions.

We @Sulu are currently adding tools to a CMS's MCP server that can write content, with explicit
permission checks on every tool call. Reading GhostSplice made the gap obvious: a permission
check scoped to the current call can answer whether that operation is allowed. It cannot tell
whether the intent behind it was assembled from several individually harmless pieces of
context.

The instruction it should have been worried about was never sitting in any single one of them.
