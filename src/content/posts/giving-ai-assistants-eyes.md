---
title: "Giving AI assistants eyes"
description: "Highlights from the Symfony Mate Q&A: the dev-only MCP server that lets AI assistants look inside your running app, and why better context beats more context."
pubDate: 2026-06-18
category: "// AI"
readingTime: "6 min"
heroImage: "/images/posts/giving-ai-assistants-eyes-header.png"
heroAlt: "Symfony Mate: giving AI assistants eyes. A terminal shows composer require, mate init and mate discover."
tags: [ai, symfony, mcp, mate]
draft: false
linkedin: "https://www.linkedin.com/posts/wachterjohannes_symfony-php-ai-activity-7474517650421997568-8BJB"
---

*By Johannes Wachter, core developer at Sulu, on [Symfony Mate](https://github.com/symfony/ai-mate): the development-only MCP server that lets AI assistants see inside your application.*

## Introduction

I first gave this talk in person at SymfonyLive Berlin 2026, and then again at Symfony Online in June 2026, that time to a remote audience tuning in from dozens of countries. Different settings, but the same energy in both: developers who use AI assistants every day and run into the same friction I do. So this is a short recap of what Mate is, why I built it, and the questions that came up in the Q&A, both on stage in Berlin and in the chat online.

The short version is that AI coding agents are powerful, but they're working half-blind. Mate gives them eyes into your running application, and that one change makes them dramatically more useful.

## The problem Mate solves

Coding agents are everywhere now, but they all share one blind spot. They can read your files, but they can't actually look inside your running app: the container, the logs, the profiler. So when you ask "this page is slow, find the problem," the agent goes off and crawls every controller, entity, repository and config file, trying to reconstruct what your tools already know.

> "If you want AI assistants to help with real software problems, don't just give them more context. That's not the right way. You should give it better context, and that is what Mate is for."

The cost of that brute-force approach isn't only tokens. It's that you can't rely on the result.

> "In German we say, when you ask two doctors about your health, you'll get three different answers. That's exactly the same problem we have with agents today."

Mate exposes profiler data, container configuration, logs, service definitions and more through MCP tools. So the agent looks at the profiler first, the way a human developer would, and then goes straight to the files that actually matter. As I said on stage, that approach scales. Mate lives in the [symfony/ai](https://github.com/symfony/ai) monorepo, there are [docs here](https://symfony.com/doc/current/ai/components/mate.html), and you can install it in one line with [`composer require --dev symfony/ai-mate`](https://packagist.org/packages/symfony/ai-mate).

## Why MCP over CLIs

A question I get a lot: why not just point agents at the CLIs we already have?

> "MCP is not a replacement for CLIs. It's the layer that lets AI use them intelligently."

The win is that MCP tells the agent when, how and why to use a tool, through input and output schemas. So it doesn't have to guess at a CLI that was introduced after its training cutoff. And because each tool is deterministic, it behaves consistently and returns predictable results. That stable base is also what lets the implementation add real reliability on top, things like retries, failover between providers, and structured error recovery, instead of the AI assistant having to improvise when something goes wrong.

## Highlights from the Q&A

**Skills instead of MCP?** It's not either/or. Skills consume tokens too, and I pointed to the work happening in the MCP protocol group on "Skills over MCP," which combines fine-grained tools with skills that describe how to use them together. I'm collaborating with the [official PHP MCP SDK](https://github.com/modelcontextprotocol/php-sdk) to help bring it to the ecosystem. As I said, "it will last a few months, hopefully only weeks." A follow-up blog post will go deeper into that topic.

**Docker support?** Yes, out of the box. The default config uses your local PHP binary, but you can just swap that for a Docker Compose command. Stephan Hochdörfer has already documented a [DDEV setup](https://blog.bitexpert.de/blog/symfony_ai_mate_ddev).

**Something like a Language Server (LSP) for agents?** It's something I'm exploring: a graph that links route definitions, service definitions, logs and PHP classes, so an agent can jump from a route straight to the right class.

**Why a separate DI container?** It's a deliberate decision, and it's required. Mate is able to run even without a working application container, so it still helps you when a broken service definition or a missing parameter has taken your app down.

**Codex or Claude Code?** Often both at the same time. Claude Code works best with MCP today, though Codex has made big steps in that direction. I also told the Codex per-project-MCP saga on stage: the [feature request I opened](https://github.com/openai/codex/issues/13056), my first ever Rust PR getting closed within the hour, and the `bin/codex` wrapper that now makes it work anyway.

## The bigger picture

Mate is secure by default, redacting secrets from profiler data, and its real power is the extension ecosystem. There's the [Symfony bridge](https://github.com/symfony/ai-symfony-mate-extension) and Monolog, plus community extensions for PHPUnit, PHPStan, Composer, Sulu and more under [MatesOfMate](https://github.com/MatesOfMate). The point of all of them is that authors curate context rather than dump it.

> "Mate is not magic. Mate is just a tool that helps curate the context better."

And the note I closed on, about how Mate came together in Amsterdam out of a few conversations and a first pull request:

> "Open source is a team sport. If you have an idea, find the right people, talk about it, and just do it. You don't need permission to open a pull request."

## Links & resources

- **Symfony Mate**: [github.com/symfony/ai-mate](https://github.com/symfony/ai-mate) · [docs](https://symfony.com/doc/current/ai/components/mate.html) · [Packagist](https://packagist.org/packages/symfony/ai-mate)
- **Symfony AI monorepo**: [github.com/symfony/ai](https://github.com/symfony/ai)
- **Symfony bridge extension**: [github.com/symfony/ai-symfony-mate-extension](https://github.com/symfony/ai-symfony-mate-extension)
- **Community extensions (MatesOfMate)**: [github.com/MatesOfMate](https://github.com/MatesOfMate) · [awesome-mate](https://github.com/MatesOfMate/awesome-mate)
- **Official PHP MCP SDK**: [github.com/modelcontextprotocol/php-sdk](https://github.com/modelcontextprotocol/php-sdk)
- **Codex per-project MCP request**: [openai/codex#13056](https://github.com/openai/codex/issues/13056)
- **DDEV setup (Stephan Hochdörfer)**: [blog.bitexpert.de](https://blog.bitexpert.de/blog/symfony_ai_mate_ddev)
- **Talk slides**: [wachterjohannes.github.io/symfony-mate-berlin](https://wachterjohannes.github.io/symfony-mate-berlin/)

---

*Quotes are transcribed from the session's auto-generated captions and lightly edited for readability, so please check them against the recording before publishing. The project name is standardized as "Symfony Mate" throughout.*
