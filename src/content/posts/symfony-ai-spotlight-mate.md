---
title: "Symfony AI Spotlight: Mate, an Agent's Way into Your Runtime"
description: "Mate gives a coding agent what source code can't: what a Symfony application actually just did. As of Symfony AI 0.13 it's a plain CLI with a discovery layer on top."
pubDate: 2026-09-14
category: "// BUILD"
readingTime: "5 min"
heroAlt: ""
tags: [symfony, ai, mate, agents]
draft: false
canonicalUrl: "https://symfony.com/blog/symfony-ai-spotlight-mate-an-agent-s-way-into-your-runtime"
originalPublisher: "the official Symfony blog"
skipFeatured: true
---

An agent working on a Symfony project can read every line of your source code and still not know what actually happened on the last request: which query was slow, or what the profiler already recorded five minutes ago, before anyone thought to ask. Source code describes what a system can do. It says nothing about what it just did.

Mate closes that gap. It started as an MCP dev server exposing a running Symfony application's internals (the profiler, the logs, the container) to a coding agent. As of Symfony AI 0.13, it's a plain CLI with a discovery layer on top: no server process to run, no protocol handshake, just commands an agent can call directly, and enough context for it to know when to call them.

The premise hasn't changed: a Symfony application already surfaces the facts an agent needs to debug it well, through the profiler, the container and the logger. Mate's job is to open a door into knowledge a project already has, not to manufacture anything new.

## What Mate Actually Shows an Agent

The idea is simple: give an agent the same runtime information a developer already reaches for by hand, as a set of small, focused commands.

A few examples from what ships with the component today:

```
symfony-profiler-list     List and filter recent profiler entries
symfony-profiler-get      Fetch one profiler entry by token, with its collectors
monolog-tail              The most recent log entries, filterable by level/channel
monolog-search            Search log entries by text or regex, with the same filters
symfony-services          Search DI container services by ID, class or tag
symfony-service-detail    Full detail on one service: class, tags, method calls, factory
server-info               PHP version, OS and loaded extensions
```

Each one does one thing. `symfony-profiler-list` and `symfony-profiler-get` work as a pair: list recent profiles filtered by method, URL or status code, then fetch one by token for the collectors it recorded and read any of them in full, the same drill-down you'd do by hand in the profiler UI. `monolog-tail` and `monolog-search` turn "what just went wrong" into a filtered query instead of a grep through a log file, with the same level, channel and environment filters on both. `symfony-service-detail` answers "what is this service, really": its class, its DI tags, the method calls configured on it and the factory that builds it, the kind of question that used to mean opening the compiled container by hand.

Mate reads that information from the artifacts Symfony already writes to disk (the dumped container, the profiler store, the log files) rather than booting the application itself. That pays off in the worst case: when a broken container is the reason the application no longer starts, Mate can still inspect the last container Symfony successfully dumped.

None of this is new information: it's the profiler and the logger, the tools you'd already reach for by hand, handed to the agent directly instead of reconstructed by guessing from source code. A human could always get to this data. What changes for an agent is that reaching it no longer takes reading five files and inferring the rest.

## How an Agent Finds It in the First Place

Commands on disk are not the same as commands an agent knows to use. That's the part Mate had to get right after dropping the MCP server, and it's the most relevant change in 0.13.

`mate init` asks how your coding agent should invoke Mate (plain, through `docker exec <container>`, `ddev exec`, or similar) and records the answer, together with the PHP version Mate was set up under. That matters more than it sounds: Mate needs to inspect the artifacts of the project under the same environment the application uses. The recorded invocation makes wrappers such as `docker exec <container>` part of the instructions the agent receives, while the PHP version acts as an additional guardrail. If Mate is started under a different PHP major or minor, it refuses to continue.

From there, `mate init` and `mate discover` write CLI-oriented instructions into a managed block inside your project's `AGENTS.md`, with a `CLAUDE.md` that imports it, so the agent knows Mate exists before it needs to guess.

Skills carry the rest: not just that a command exists, but when to reach for it. Five task-focused skills cover profiler debugging, log investigation, request triage, service inspection and PHP environment checks, each shipping with the package whose tools it explains. `system-information` complements them for installed package and dependency versions. Mate installs them into the project with:

```
$ vendor/bin/mate skills:install
```

And they have a real lifecycle around them now, not just an install step: `skills:enable` / `skills:disable` to toggle one without removing it, and `skills:override` / `skills:reset` when a project needs to adjust a shipped skill, say to add a house rule about which environment is safe to query, without losing the ability to hand it back to Mate later and get the shipped version again.

## Extending It: Your Own Tools and Skills

Mate's tool set isn't closed. A project, or an extension package, can add its own capability with a single attribute:

```php
namespace Mate;

use Symfony\AI\Mate\Attribute\MateTool;

final class DeploymentTool
{
    /**
     * @param string $environment The environment to inspect
     */
    #[MateTool(
        name: 'deployment-status',
        description: 'Get the current deployment status for an environment.',
    )]
    public function getStatus(string $environment): string
    {
        // ...
    }
}
```

`#[MateTool]` is method-only: reflection and the method's PHPDoc generate the same kind of input schema Mate uses for its own tools, so the agent gets a discoverable, typed contract without any extra wiring. Drop the class into `mate/src/`, which `mate init` registers as the `Mate\` namespace, and it appears in `tools:list` on the next run, with no service definition to write. Only `name` is required. `title` and `description` are optional, worth adding when they help an agent decide whether the tool answers its question, but the attribute works without them. `#[MateResource]` and `#[MateResourceTemplate]` cover the same ground for data an agent can read rather than invoke, a changelog file or a status page, without needing a method call to fetch it.

If the capability belongs in more than one project, the same mechanism can live in a reusable Mate extension instead of a single class. The MatesOfMate organization collects those: an extension template plus integrations for PHPUnit, PHPStan, Rector and Composer.

A tool by itself is still just a command sitting on disk. Pair it with a short skill describing when to reach for it: point `extra.ai-mate.skills` at a directory in your project, and your skill goes through the same `skills:install` reconciler as the ones Mate ships with, no second registration mechanism to learn.

## Try It

Mate is part of Symfony AI. `composer require --dev symfony/ai-mate`, then `vendor/bin/mate init` in a Symfony project to get started. Mate will not know everything about every Symfony application. The useful question is which pieces of runtime knowledge repeatedly save a developer from guessing. If you find one that Mate still cannot expose, that's a good reason to open an issue or build an extension.

The repository and the component docs have the full command reference.

- **Repository**: [github.com/symfony/ai-mate](https://github.com/symfony/ai-mate)
- **Docs**: [symfony.com/doc/current/ai/components/mate.html](https://symfony.com/doc/current/ai/components/mate.html)
