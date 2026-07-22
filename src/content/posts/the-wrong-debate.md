---
title: "The wrong debate: what PHP taught me about agentic software"
description: "MCP or CLI is the wrong fight. What PHP with Composer, PSR and Symfony already learned about building things together, one layer down."
pubDate: 2026-07-22
category: "// OPINION"
readingTime: "8 min"
heroImage: "/images/posts/the-wrong-debate-header.png"
heroAlt: "Title card: the wrong debate. MCP vs CLI is the wrong fight. PHP already showed us why."
tags: [ai, mcp, php, symfony, opinion]
linkedin: "https://www.linkedin.com/feed/update/urn:li:activity:7485627287883845632/"
draft: false
---

*By Johannes Wachter, Sulu core developer. Less about a project this time, more about a pattern I keep seeing in how we argue about AI tooling, and what an older ecosystem already learned the hard way.*

## The same argument, over and over

Over the last few weeks I noticed something. Every discussion about AI developer tooling eventually becomes the same discussion. MCP or CLI? Skills or tools?

It came up again the other day. [Javier Eguiluz](https://www.linkedin.com/in/javiereguiluz/) opened a Symfony pull request for a small profiler dump command, a zero-setup command any tool can call, with structured JSON output so an agent can read request data without grepping logs. Good idea, cleanly done. And within a handful of replies we were back in the same place: is a command better than an MCP tool, should this be a skill instead, does an installed server cost too much context.

After a handful of these threads, in GitHub issues, in Slack, in personal conversations, I think we are optimizing the wrong thing. The question we keep asking, which transport or standard wins, is not the question that will make us better at building agentic software.

## It reminds me of my start in PHP

Back when I started in PHP, the argument in the community was Composer or PEAR: stability versus per-project dependencies.

Composer won that argument, but Composer winning was not the whole story. What made PHP better was a whole ecosystem learning at once. Composer for dependencies. PHP-FIG and the PSR standards for shared conventions. Symfony and Laravel. PHPUnit, PHPStan, Rector. They raised the floor together, each building on what the others had figured out.

We are repeating that argument one layer up. "Composer or PEAR" became "MCP or CLI." Same shape, same distraction.

## The argument is already dissolving

Here is the part that changed my mind, and it came from someone else in that thread. [Illia Vasylevskyi](https://www.linkedin.com/in/illia-vasylevskyi-b7353558/) pointed out that the loudest objection to MCP, that an installed server permanently eats context and re-evaluates every tool with full schemas on every request, is mostly outdated.

Modern harnesses are moving towards deferred tool loading. Claude Code and Codex support it today: instead of loading every tool's full definition upfront, the model sees a registry of server and tool names and searches before any schema or description loads into context. That is the same progressive discovery skills already use. Once that is true, the token-cost gap between an MCP tool and a CLI plus a skill narrows significantly. The architectural difference becomes much smaller than the debate often suggests.

I want to be honest about the edges, because [Joppe De Cuyper](https://www.linkedin.com/in/joppedc/) was right to push on them. This holds in Claude Code and Codex today, and it is rolling out elsewhere, but it is not universal. On Copilot and Cursor the context cost is still real right now, and Claude Code is not the default corporate tool. So if you tell me the CLI wins today, I will take it. The mechanism is already in the API and the rest will follow, but that is a direction, not a finished fact.

## So we are asking the wrong question

If the transports are converging, "should we use MCP" is the wrong question. The better one is "what makes an AI coding workflow actually good?"

The way I have come to see it is: same data, two transports. A CLI command and an MCP tool are not rivals when they read the same profiler data. A clean, deterministic CLI is exactly the kind of thing I want a tool or a skill to wrap. Give the model the command, and give it a skill that says when and how to run it. Knowing beats guessing, every time, and it is cheaper than calling `--help` before you can even start.

So the answer is not one of them. It is a combination. MCP where structured, deterministic access wins. CLI where zero setup and composability win. Skills to tie it together and teach the agent how. The cost was never that tools cost tokens. It is not having a good tool. A bad tool and a bad CLI are equally bad.

Look at the thread again with that lens and everyone is right. Illia, that the transports have converged, and that too many overlapping tools is the real problem left to solve. Joppe, that the CLI wins in practice today. Javier, that a zero-setup command any tool can call is the right primitive. [Kevin Bond](https://www.linkedin.com/in/zenstruck/), that generators like the Maker should become skills. They are not really disagreeing. They are describing different parts of one system.

Once I stopped asking who is right and started asking which part of the problem each of them is solving, the whole thread looked different. The CLI advocates are optimizing for portability. The MCP side is optimizing for deterministic integration. The skills people are optimizing for knowledge. None of those goals conflict. They are different layers of the same stack.

## Mate is where I want the pieces to meet, not the winner

Building Mate has given me something like a front-row seat to these discussions. It has also left me unsure the tools Mate exposes today are even the right ones, and willing to rework all of them. That is the real open problem Illia named, working out how much tooling you need without drowning the model in it.

A concrete example of why this is hard. Making Mate depend on a `bin/console` command is not trivial. It only lands on the newest Symfony, and in a debugging session the application kernel or service container is often exactly what is broken, so invoking `bin/console` can fail right when you need the profiler most. That is why Mate reads the profiler through its own isolated container instead. Or maybe the cleaner primitive is for the profiler to write a Markdown file on each request that both an agent and Mate can read, less machinery and no broken-container problem. I do not know yet. That is rather the point. Mate is the foundation I want to bring these pieces together on, not the thing that wins.

## The real risk

Looking back, I think the biggest risk for our community is not choosing the wrong transport. It is spending the next two years arguing about transports instead of learning how to build better agentic software.

We already have the ingredients. Deterministic tools. Runtime context. Packaged knowledge. Local execution. Shared conventions. Emerging standards. The opportunity is not deciding which one wins. It is figuring out how they work together. That is the same kind of collective work Composer and Symfony already did for PHP, one layer down.

I do not particularly care whether the future is called MCP, or Skills, or something none of us have built yet. We are already discussing alternatives in the open, and if something better shows up, Mate will adopt it. Those are just today's standards for shipping knowledge and tools. The standard was never the point.

> Standards are temporary. Better ways of building software are not.

Lately I have started acting on this inside Mate itself, questioning how much of its machinery a coding agent really needs. Where that leads is a story for a follow-up, soon.

## Links & resources

- **The arc so far**: [Giving AI assistants eyes](/blog/giving-ai-assistants-eyes) · [Skills over MCP](/blog/skills-over-mcp) · [The last mile: distributing Agent Skills to real agents](/blog/the-last-mile)
- **Symfony Mate**: [github.com/symfony/ai-mate](https://github.com/symfony/ai-mate)
- **The profiler-command PR**: [symfony/symfony#64824](https://github.com/symfony/symfony/pull/64824)
- **The skills polyfill (skills:install)**: [symfony/ai#2213](https://github.com/symfony/ai/pull/2213)
