---
title: "Kill the MCP"
description: "I deleted the MCP server from a Mate prototype and kept the tools. What that cost, what it bought, and why the reflex is the thing worth killing."
pubDate: 2026-08-04
category: "// OPINION"
readingTime: "10 min"
heroImage: "/images/posts/kill-the-mcp-header.png"
heroAlt: "Title card: Kill the MCP. I deleted the MCP server from my own MCP project. A dark terminal shows the Mate CLI listing and calling tools, with no mcp/sdk and no server."
tags: [ai, mcp, php, symfony, opinion]
draft: false
linkedin: "https://www.linkedin.com/feed/update/urn:li:share:7490634951298777089/"
---

*By Johannes Wachter, Sulu core developer. The follow-up I promised at the end of the last piece. Less a debate this time, more a report from the workbench: what happened when I took my own advice literally and started deleting things.*

## I deleted the MCP server from a Mate prototype

Mate is an MCP dev server. That is the one-line description I have used since the beginning, since the first conversation about it with Tobias Nyholm: it exposes a running Symfony app's internals, the profiler, the logs, the container, to a coding agent as MCP tools. I wrote most of that server myself.

Recently I prototyped removing it. Not refactoring the MCP layer, removing it. No `mcp/sdk` dependency, no server to start, no protocol handshake. The tools stayed. The transport in front of them left.

That sounds like a contradiction with everything I argued in [The wrong debate: what PHP taught me about agentic software](https://johanneswachter.dev/blog/the-wrong-debate), where the whole point was that the transport debate is the wrong debate. It is not. It is what that piece was quietly building toward.

## The reflex worth killing

Here is the thing I actually want to kill, and it is not a protocol. I love MCP for what it does well.

The reflex is narrower than "build a server for everything." It is clinging to a transport once you have picked it. I picked MCP for Mate early on and kept treating that choice as settled, the same way "should this be its own service" stopped being a real question and became a habit during the microservices decade. The transport calcified before I checked whether it still fit.

MCP is a genuinely good standard for what it was built for: a stable, discoverable, cross-vendor interface between an agent and a system it does not control. That is real, and I am not throwing it away. What stopped fitting was treating that choice as permanent for Mate specifically, which runs locally and whose primary clients already have shell access.

So when I say "kill the MCP", I mean kill the reflex of never re-checking a transport once you have chosen it. Not the protocol, but the habit of leaving that choice unexamined.

## What Mate actually needed

Mate's primary audience is Claude Code, Codex, Cursor and other agents that already use shell commands to interact with a project. Modern harnesses can defer MCP tool schemas until they are actually needed, the point I made in the previous piece, so context usage is not the argument that carries this. What no longer fit was the operational shape: an MCP server gives Mate a second lifecycle, a process to start, configuration to generate, a handshake to complete, another discovery path to maintain, for an audience that already had a simpler way in.

A CLI has the opposite shape. It sits on disk and costs nothing until it is called, but that comes at a cost MCP doesn't pay: a bare CLI is effectively invisible if nothing tells the agent it exists. An MCP client gets the tool list handed to it automatically; a CLI only gets that same visibility once a skill or some other instruction teaches the agent to look for it. Once it knows to look, the agent reads the command's interface on demand, the way it reads any other command, with `--help`. It runs, returns its result, and exits. That is an explicit process boundary, not extra determinism. An MCP call can be just as deterministic, but this removes the server's lifecycle and session state from Mate's architecture.

For a project whose whole job is to hand an agent structured facts about a Symfony application, that is a better fit. For this audience, the server added a second route to capabilities the package could already expose through the shell.

## Same tools, no server

The hard part was never the CLI. It was cutting the tools loose from `mcp/sdk` without losing what that dependency did for me, because it did real work: it discovered the tools and generated their input schemas.

So the prototype rebuilds that natively. A small set of PHP attributes now mark a method as a capability, and a reflection-based discoverer reads its signature and PHPDoc to generate the same kind of JSON input schema `mcp/sdk` used to produce. The useful contract behind the tool survives intact: a described and typed operation an agent can discover and invoke. What disappeared was the server that used to expose it through MCP.

On top of that sit plain commands. `tools:list` shows what is available, `tools:inspect` loads one contract, `tools:call` invokes it:

```bash
vendor/bin/mate tools:list
vendor/bin/mate tools:inspect <tool>
vendor/bin/mate tools:call <tool> --param=value
```

That is the entire front door: discover, inspect, call. A `--json` escape hatch is there for complex input, and JSON output is preserved for agents that parse it. The whole server runtime, the serve and stop commands, the session layer, the generated MCP configuration, and the Codex wrappers, is gone. `mate init` and the agent instructions were rewritten to point agents at the CLI instead of at a server.

The result reads almost boringly, which is the point. Less machinery, fewer moving parts, and the same knowledge reaching the agent.

## This is not a verdict on MCP

I want to be careful here, because a provocative title makes it easy to hear "MCP was a mistake." That is not what happened and not what I believe.

This works for Mate because it runs locally and its primary clients already have shell access. Flip either of those and the calculus flips back. If you are exposing a system to agents you do not control, or to clients that are not shells, or across a vendor boundary where a shared standard is the whole value, MCP is a strong fit there, and in that situation I would build the server. The last article's conclusion still holds at the ecosystem level: different systems need different front doors, and sometimes the answer is a combination. That does not mean every individual package has to ship all of them. This is me choosing, for one project, which part of that combination actually earns its place.

Moving to a CLI also changes where permissions are enforced. An MCP client can list and approve tools individually before anything runs. A CLI instead inherits whatever shell policy the agent already runs under. For a local dev tool that may be the right trade, but it is a trade, not complexity that simply vanished.

The obvious follow-up is why not just keep both. Optionality is not free: two front doors mean two discovery paths, two sets of documentation, two error mappings, two things to keep in sync. Decoupling the tools from `mcp/sdk` makes an MCP adapter possible to add back later. It does not mean both automatically earn a permanent place in the package. The prototype removes the server to find out whether Mate actually loses anything that matters. If it does, MCP can come back as an adapter, not as the architecture everything else depends on.

And I should be honest about the state of it. This is a reversible prototype, not a shipped decision. It is a breaking change. As I write this, the prototype is open upstream as a proposal for Symfony AI. It is not merged, and it may not be. I built it partly to find out whether the tools really could be decoupled from the protocol cleanly, or whether `mcp/sdk` was load-bearing in ways I had not noticed. The dependency came apart more cleanly than I expected: the component and bridge test suites run green against the native attributes, with nothing left referencing the old namespace. That is evidence, not a verdict.

Alongside that, I am running a broader set of tests and agent sessions against both versions, to see whether the CLI actually holds up against the server in practice and not just on paper: whether agents find the right tool, pass complex arguments reliably, recover from a bad call, behave consistently across shells and permission prompts, and how much instruction has to be carried into each session to get there. The first result was blunt: without a skill or instructions pointing at it, the CLI was invoked zero times in 30 runs. Not one agent found the tools on its own. With a well-designed skill in place, that discovery gap closed and the CLI performed comparably to the server in this measurement. That was enough to move the proposal upstream. That comparison is not finished. When it is, I will publish it on the same channel.

## Don't marry the transport

If there is one portable lesson under all of this, it is that.

For Mate, the durable asset is the tool, the schema, the knowledge behind it, not the transport. Transport choices tend to harden into architecture the moment they are made. They are also the part you should hold most loosely. How an agent reaches that knowledge should be isolated well enough that the transport can change without rewriting the capability itself.

The decoupling should make it possible to add an MCP adapter back on top of these same native tools without coupling the tools themselves to the protocol again, precisely because I stopped treating the server as the thing and started treating it as one possible front door. That is the whole trick. Keep the tool, keep the schema, keep the knowledge. Let the transport be replaceable.

## What I'm watching for

The open question now is not "CLI or MCP." It is whether the native attribute-and-reflection approach stays as clean as it looks once more capabilities land on it, or whether I have just moved the complexity I deleted somewhere I cannot see yet. Prompts, for instance, were not ported, because Mate ships none today. The pattern should extend to them. "Should" is the word I am watching.

So, kill the MCP. Not the protocol, but the reflex that every tool an agent touches has to be wrapped in a server. Sometimes the right interface for an agent is the same one you would have given a developer: a command, and enough knowledge to know when to run it.

> The transport is the part you should hold most loosely.

## Links & resources

- **Part 1**: [The wrong debate: what PHP taught me about agentic software](https://johanneswachter.dev/blog/the-wrong-debate), on why the MCP-vs-CLI argument is the wrong one, and why the answer is the combination.
- **Symfony Mate**: [github.com/symfony/ai-mate](https://github.com/symfony/ai-mate)
- **The proposal** (reversible, open upstream, not merged): [symfony/ai#2380, replacing the MCP server with a native CLI](https://github.com/symfony/ai/pull/2380).
