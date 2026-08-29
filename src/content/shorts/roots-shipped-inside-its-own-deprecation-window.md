---
title: "Roots shipped inside its own deprecation window"
description: "MCP's 2026-07-28 specification deprecated Roots, Sampling and Logging, with at least twelve months before they become eligible for removal. On August 14th, my Roots support PR merged into the official PHP SDK. None of this was hidden."
pubDate: 2026-08-30
tags: [mcp, php, open-source]
source: "https://blog.modelcontextprotocol.io/posts/2026-07-28/"
lang: en
---

MCP's `2026-07-28` specification deprecated Roots, Sampling and Logging, with at least
twelve months before they become eligible for removal. On August 14th, my [Roots support
PR](https://github.com/modelcontextprotocol/php-sdk/pull/395) merged into the official PHP
SDK.

None of this was hidden. The PR had been open since July 14th, and the PHP SDK repository
had already been tracking the upcoming Roots deprecation [since
May](https://github.com/modelcontextprotocol/php-sdk/issues/339). Nothing about the
implementation was wrong either: review checked whether it implemented Roots correctly, and
it did. Chris flagged the deprecation shortly before the merge, and we decided to ship Roots
support anyway.

Building against a young specification makes this easier to trigger, but I don't think it is
really a protocol problem. It is a process problem, and a more uncomfortable one than a
warning nobody saw: we did see it, just late enough that the implementation was already
finished.

The problem wasn't that the warning was missing. It was that by the time it became part of
the decision, changing course had become the more expensive choice.
