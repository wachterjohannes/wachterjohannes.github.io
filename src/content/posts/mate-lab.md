---
title: "The Mate Lab: does an agent actually use a dev tool?"
description: "I measured whether Symfony Mate actually gets used by a coding agent, not just whether it's available. The result behind the Kill the MCP bet."
pubDate: 2026-08-25
category: "// MEASUREMENT"
readingTime: "6 min"
heroImage: "/images/posts/mate-lab-header.png"
heroAlt: "Title card: Visibility, not transport. A SKILL.md card shows name: mate-discovery, description: Find and use Mate's CLI tools, body note Read this before grepping. Footer: Measurement, visibility beats transport."
tags: [ai, mcp, symfony, mate]
draft: false
---

*By Johannes Wachter, Sulu core developer. The bet I made in Kill the MCP, actually measured.*

When I removed Mate's MCP server and replaced it with a native CLI, I made a bet I never
actually measured. [Kill the MCP](/blog/kill-the-mcp/) argued that the transport was
never the point, that the tools and the knowledge behind them mattered more than the
protocol carrying them. But an MCP server does something a bare command line does not: it
tells the agent, unprompted, exactly what's available. Strip that away and you're betting
that something else will do the same job. I bet on Skills. I hadn't checked whether that
bet actually held.

So I built a small measurement setup to check it.

## What I actually tested

Not whether Mate works when you use it. Whether an agent reaches for it in the first
place. Those are different questions, and the second one is the one that decides whether
a dev tool survives contact with a real coding session, where nobody is going to remind
the agent to check.

I took two small tasks, each with a real, injected performance bug (the kind that shows
up in a Symfony app's profiler once you go looking), gave an agent access to a fresh copy
of the same application, and varied only one thing: how Mate was exposed. No Mate at all.
Mate wired up as an MCP server. Mate as a bare CLI, no scaffolding around it beyond the
binary itself. Mate as a CLI with Agent Skills and project instructions layered on top,
files that tell the agent what exists and when to reach for it. That combination is what
I'll call a file-based discovery layer for the rest of this piece.

Ten runs per condition, per task, on Claude Haiku. I picked the smaller model on purpose.
A frontier model like Claude Opus doesn't need much help finding a tool it's told exists:
in a small ceiling check, it used Mate in every run regardless of how it was exposed.
That's the ceiling case, worth naming and then setting aside. The interesting question is
what happens with a model that has less budget to go exploring.

## What actually got used

Counting how many of the ten runs per condition touched Mate at all, not how many solved
the task:

| Condition | Task 1 | Task 2 |
|---|---|---|
| Mate as MCP server | 3 / 10 | 2 / 10 |
| Mate as bare CLI | 0 / 10 | 0 / 10 |
| Mate as CLI + file-based discovery | 10 / 10 | 5 / 10 |

*Invocation rate, not task success.*

A bare CLI was invisible. Not once, across twenty runs on two different tasks, did the
model touch it unprompted. The MCP server got used sometimes, but inconsistently: three
times on one task and twice on the other. Adding the file-based discovery layer is what
actually made the tool part of how the model worked, reliably on one task and roughly half
the time on the harder one.

## Visibility was the missing variable

Read as a straight MCP-versus-CLI comparison, the table looks bad for the CLI. MCP wins on
both tasks. But the bare CLI is missing something the MCP server provides by default:
discovery. The comparison that matters isn't MCP against CLI as transports, it's one discovery
mechanism against another: MCP's tool advertisement against the file-based discovery layer.
In these runs, the file-based setup was used more often than MCP on both tasks, sharply so
on one of them.

What the MCP server was actually doing, underneath the protocol, was advertising. Every
tool it exposed got handed to the model as something it could use, whether the model
needed it in that moment or not. A bare CLI doesn't do that; it just sits on disk, and a
model with a limited budget for exploring rarely goes looking. Skills and project
instructions move that discovery into files the agent can load when needed, without
requiring a separate server lifecycle. That's the actual finding: transport alone wasn't
the deciding variable. Visibility was.

## What this doesn't prove

This is one model family, two tasks I built myself, ten runs per cell. Small enough that
I'm reporting a pattern, not a statistically proven effect, and I'd want a lot more runs
before treating the exact numbers as fixed. It also only measures whether the tool got
touched, not whether the agent used it well once it did, or whether the same gap holds on
a completely different kind of task. I'm continuing to run this kind of measurement on
Mate, and there's more of it than fits in one piece.

It's also not the only check happening. A community contributor, Matthias Breddin, opened
[PR #81](https://github.com/wachterjohannes/symfony-ai/pull/81) on the Mate repo, testing
another part of the same problem: whether the wording of Mate's generated instructions
changes whether models trust and follow them at all. I ran a separate set of tests against
his change, and the behavioral effect was clear: across 44 runs, the old wording made models
treat the instructions as a suspicious command and push back or refuse, 43 times out of 44.
The provenance-based wording caused that same reaction zero times. Whether that also
improves task success is less clear, and my measurements weren't
strong enough to claim it.

That points at the next layer: making a tool visible is not enough. The model also has to
trust the thing that tells it the tool exists.

But the direction is clear enough to answer the question Kill the MCP left open. In these
runs, the CLI switch did not quietly cost Mate visibility once the file-based discovery
layer was added. It moved the job of making a tool visible from a protocol to a handful of
Skill and instruction files, and for the model that actually needed the help, that job
still got done.

## Why I measured this at all

I've spent a fair amount of this year arguing that AI needs better context, not more of
it, and that developer tools should hand agents the same runtime knowledge they already
give to us. It's easy for that argument to stay a claim. Measuring whether the tool
actually gets reached for, not just whether it's technically present, is the part that
turns an architecture decision into something you can check.
