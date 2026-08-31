---
title: "The hardest code to delete is your own"
description: "My first Symfony AI release as a core team member deletes the MCP server from Mate. PR #2380 ships in 0.13, and what it actually cost to ship the answer."
pubDate: 2026-08-31
category: "// OPINION"
readingTime: "4 min"
heroImage: "/images/posts/the-hardest-code-to-delete-header.png"
heroAlt: "Title card: The hardest code to delete is your own. A dark terminal shows mate init writing AGENTS.md and CLAUDE.md, mate discover installing 5 skills, and mate serve marked removed. Footer: Symfony AI 0.13, MCP server removed."
tags: [ai, mcp, php, symfony, mate, opinion]
draft: false
---

*By Johannes Wachter, Sulu core developer. The wrong debate made the argument, Kill the MCP
made the bet, and The Mate Lab measured it. This is what shipping the answer actually cost.*

My first Symfony AI release as a core team member deletes the MCP server from Mate.

That sentence feels stranger to write than I expected.

Mate started as an MCP server. I built it that way, talked about it that way, gave a
conference talk about it that way, and spent months making that architecture work. And the
first release since I joined the Symfony AI core team is the one that removes it.

## Mate was an MCP project

None of it happened by accident. The SDK, the server process, the client configuration, the
workarounds for clients that didn't quite implement the protocol the way the spec suggested,
all of it existed because MCP was the premise, not a detail underneath it.

A few weeks ago I called the experiment Kill the MCP. At the time it was deliberately
provocative: could Mate keep its tools, schemas and knowledge while treating MCP itself as
replaceable?

It could. But not in the naive form I first built.

## The embarrassing zero

Removing MCP was not as simple as replacing the server with three CLI commands. I learned
that the embarrassing way: in thirty controlled runs, the bare CLI was invoked exactly zero
times.

I wrote up the experiment separately in
[The Mate Lab](https://johanneswachter.dev/blog/mate-lab). The important part for this
release is what it forced me to change. MCP had been providing discovery as well as
transport. If I wanted to remove one, I had to deliberately rebuild the other.

## What actually shipped

Once I separated the protocol from the capabilities, surprisingly little of what mattered
actually depended on MCP. The tools, their schemas, the runtime access Mate gives an agent,
the knowledge encoded in skills, discovery itself, none of that needed to live inside an MCP
server. What needed to go was the coupling between those things and one specific transport.

PR [#2380](https://github.com/symfony/ai/pull/2380) does exactly that. The MCP server and the `mcp/sdk` dependency are gone, along with
`mate serve` and `mate stop`. The tools remain, reachable through the CLI. `mate init` and
`mate discover`, the managed block they write into `AGENTS.md`, and the skills layered on top
carry the discoverability MCP used to provide for free.

"Kill the transport, not the capability" wasn't a new idea by the time this shipped. It was
the old one, now sitting in released code instead of an argument.

## The code was mine

There is a particular kind of resistance when the code you are deleting is code you wrote
yourself.

The MCP server wasn't legacy code somebody else had left behind. I had chosen the SDK, built the
integration, added lifecycle commands, generated client configuration and worked around
clients that didn't quite fit. Some of those workarounds were clever. Some took a lot of
time.

None of that is an argument for keeping the architecture.

The amount of work that went into an architecture says surprisingly little about whether it
should survive the next one.

I joined the Symfony AI core team thinking mostly about what I might get to build next.

But I also knew what I didn't want my first release to become: an excuse to put another layer
of my own on top of the project. If an architecture I had built no longer earned its place,
having more responsibility for the project was a reason to remove it, not protect it.

Mate started as an MCP server. In 0.13, that server is gone.

The part I wanted to keep was never the protocol. It was what Mate lets an agent see happening
in your runtime.

## Links & resources

- **Part 1**: [The wrong debate: what PHP taught me about agentic software](https://johanneswachter.dev/blog/the-wrong-debate)
- **Part 2**: [Kill the MCP](https://johanneswachter.dev/blog/kill-the-mcp)
- **The measurement in between**: [The Mate Lab: does an agent actually use a dev tool?](https://johanneswachter.dev/blog/mate-lab)
- **The merged PR**: [symfony/ai#2380](https://github.com/symfony/ai/pull/2380)
- **Symfony Mate**: [github.com/symfony/ai-mate](https://github.com/symfony/ai-mate)
