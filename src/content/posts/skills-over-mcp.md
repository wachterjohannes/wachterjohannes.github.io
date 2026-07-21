---
title: "Skills over MCP: shipping Symfony know-how with Mate"
description: "What an Agent Skill actually is, how you serve one over MCP, and lessons from building a reference implementation against a spec that kept moving."
pubDate: 2026-07-02
category: "// MCP"
readingTime: "11 min"
heroImage: "/images/posts/skills-over-mcp-header.png"
heroAlt: "Skills over MCP: shipping Symfony know-how with Mate."
tags: [ai, mcp, skills, symfony, mate]
draft: false
linkedin: "https://www.linkedin.com/pulse/skills-over-mcp-shipping-symfony-know-how-mate-johannes-wachter-zkdbf"
---

*By Johannes Wachter, core developer at Sulu. A deeper follow-up to my [Symfony Mate talk](https://www.linkedin.com/posts/wachterjohannes_symfony-php-ai-ugcPost-7474517649868283904-Inz_/), digging into one thread that kept coming up in the Q&A: should this be skills instead of tools, and what would "skills over MCP" actually look like?*

## Introduction

In the Mate Q&A, someone asked whether I had thought about shipping skills instead of an MCP server. At the time I gave the short answer, which was "it's not either/or." This post is the long answer, the one I didn't have time for during the live Q&A at Symfony Online.

It's really a story in two halves. The first half is technical: what a Skill actually is, and how you serve one over MCP. The second half is more personal, a contribution journey, where I built a reference implementation against a specification that kept moving while I was working on it, and learned a few things the hard way. If you only remember one sentence from all of this, make it this one.

> AI assistants don't lack capability. They lack context at the right moment. Skills package that context, MCP distributes it, and Mate delivers it into your project.

Before we go deep, here is the whole idea in one picture.

![Overview: an agent triages on cheap descriptions, then Mate serves the matching skill over the same MCP connection as its tools](/images/posts/skills-mcp-fig1.png)

*Mate serves know-how (Skills) from the Symfony extension over the same MCP connection as its tools. The agent triages on cheap one-line descriptions, then loads the full instructions, and deeper references, only when the task calls for it.*

> **Please read this first.** This post is forward-looking. "Skills over MCP" is a working draft, [SEP-2640](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2640), still being discussed in the MCP working group, and the format will keep changing. No mainstream agent consumes Skills over MCP yet (Claude Code reads them from the filesystem), and my pull requests are experimental, most still open. To bridge the gap today I'm working on a filesystem polyfill, but that's an open task too, with a dedicated follow-up post to come. So treat this as a tour of where things are heading, not something to ship on Monday.

## What a Skill actually is

Strip away the hype and a Skill is almost boringly simple, which I mean as a compliment. It's a folder with a `SKILL.md` file at the root. The frontmatter has exactly two required fields, a `name` (a short lowercase slug) and a `description` (one plain sentence). Everything below the frontmatter is just Markdown instructions, and you can drop an optional `references/` subfolder and some scripts next to it.

The clever part isn't the file format, it's how the thing gets loaded, which the spec calls progressive disclosure. It works in three tiers. The `description` is always in context. It's tiny and cheap, and it's the triage signal that whispers to the agent "this might be relevant." The `SKILL.md` body is loaded only once the task actually matches that description. And anything in `references/` is loaded only when the agent genuinely needs to go deeper.

It's worth pausing on why that mirrors how good developers already work. A senior dev knows the Symfony Profiler exists, and reaches for it when a request misbehaves. They don't walk around with the entire Profiler manual memorized. That's the whole trick, and it's also why I find the model so convincing.

> AI assistants are great generalists but weak specialists.

The cost side falls out of this naturally. Context windows are finite, and every token you spend on instructions the task never needed is wasted. Progressive disclosure means you only pay for the tier the task actually reaches.

A minimal Skill looks like this.

```markdown
---
name: symfony-profiler-debugging
description: Investigate requests, exceptions, and performance using the Symfony Profiler
---

When a request misbehaves, open the Profiler before guessing...
```

And here is the same mental model drawn out, with cost growing as you descend, and the agent only descending when the task demands it.

![Progressive disclosure across three tiers, from a tiny always-loaded description down to on-demand references](/images/posts/skills-mcp-fig2.png)

## Serving Skills over MCP

Mate already runs as an MCP server for PHP projects, with Symfony support shipped as one of its extensions, so the obvious move is to let Skills ride the same connection. No new transport, no second daemon, just a bit more traveling over the wire the agent is already talking to. You can see that shared connection in the overview figure above: the same pipe carries the tools (actions) and the skills (know-how).

The decision that matters most is which MCP primitive to use, and Skills are served as Resources rather than Tools. That sounds like a detail, but it captures the whole spirit of the thing: Skills are read, not called. A tool is something the agent invokes to make something happen. A Skill is something the agent reads to learn how. The URI scheme follows from that, with `skill://<path>` addressing the files and `skill://index.json` acting as the discovery index.

> A Skill on your filesystem helps your project. A Skill shipped in an extension helps every project that installs it.

The discovery index is where most of the design effort went, and where the spec changed the most. It's a simple list of the available skills, each with its frontmatter, a link to the files, and a digest that doubles as an integrity check and a cache key. That last part is the nice bit: a client that has seen a digest before can skip re-fetching a skill that hasn't changed.

The load sequence below is where that digest really earns its keep.

![Sequence: the client reads the index, triages on descriptions, checks the digest cache, then reads the skill body](/images/posts/skills-mcp-fig3.png)

## What this looks like in Mate

All of that is plumbing. The payoff is what you can ship through it. For Mate's Symfony bridge I scaffolded two Skills.

The first is `symfony-profiler-debugging`. When the prompt is "the page is slow" or "this request misbehaves," it walks the agent through a proper Profiler investigation: collectors, the timeline, the database queries. It also has a `references/collectors.md` for the deep dive, which makes it a tidy demonstration of all three disclosure tiers in a single skill.

The second is `symfony-container-introspection`, which covers service IDs, autowiring, tags and compiler passes.

The framing is the part I care about most. Neither of these adds a new capability. Mate already exposes the Profiler and the container through its tools. What the Skills add is the judgment of how to use those capabilities the way an experienced Symfony developer would.

> Skills ship know-how, not just actions.

## Building against a moving spec

The technical work was the easy half. The genuinely interesting half was that I was implementing a specification while it was still being written, which is a different kind of challenge.

The trail of artifacts looks like this. I scaffolded the Skills and rewrote the `INSTRUCTIONS.md` for Mate's Symfony bridge in [symfony/ai#2132](https://github.com/symfony/ai/pull/2132). I built the reference implementation in the official MCP PHP SDK in [php-sdk#372](https://github.com/modelcontextprotocol/php-sdk/pull/372): making a skill's files available over the connection, the index that lists what's there, and the digests that handle caching. I fed the findings back upstream into the working group's [experimental-ext-skills](https://github.com/modelcontextprotocol/experimental-ext-skills) repo, including an experimental-findings note and a small doc-drift fix in [PR #98](https://github.com/modelcontextprotocol/experimental-ext-skills/pull/98), which got merged. And I joined the review thread on the spec itself, [SEP-2640](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2640).

The lessons that came out of that are honestly more useful than any single line of code.

**The spec moves under you.** The index format got redesigned mid-flight. The `$schema` and the `type` / `SkillType` fields were dropped, it switched to verbatim frontmatter plus digests, and the whole thing was decoupled from the `agentskills.io` `.well-known` schema. My code had to chase all of it, and at one point I deleted an entire `SkillType` enum that had quietly become dead.

> Building against a moving spec is its own skill.

**Separate the stable from the speculative.** The `SKILL.md` format itself, frontmatter plus progressive disclosure, is stable and safe to build on. The transport around it, the index shape, the `resources/directory/read` calls, the capability negotiation, is still churning. Knowing which layer you're standing on tells you how defensively to write.

**Doc drift is real on fast-moving specs.** The spec PR and the working group's repo-local draft disagreed about the `_meta` prefix. Fixing that disagreement was a small, concrete, mergeable contribution. Little PRs that reduce confusion tend to land fast, and they're a good way to stay useful while the big questions are still open.

**Concede cleanly when a maintainer is right.** A couple of my review comments turned out to be wrong, and the maintainers were right to push back. Admitting that quickly and turning my attention to the real problem, the mismatched docs, got us much further than arguing would have.

## The honest caveat

I want to be very clear about where this stands today, because it would be easy to read the sections above and assume any of this is ready. It is not.

The specification is not finished. "Skills over MCP" lives in SEP-2640, which is a working draft still under active discussion in the MCP working group. It has already been redesigned more than once while I was working on it, and it will keep changing. Nothing about the index shape, the capabilities, or the transport should be treated as settled.

The agent support isn't there yet either. Right now, no mainstream agent actually reads Skills over MCP. Claude Code and the others load Skills from the filesystem, not over a live MCP connection. So even a perfect implementation has very few places it can run today.

That gap is exactly why I'm also building a polyfill, [symfony/ai#2213](https://github.com/symfony/ai/pull/2213). It installs the Skills that Mate extensions ship straight onto the filesystem, where the agents already look for them, and it runs automatically as part of `discover`. It's deliberately a stopgap, meant to be retired once agents read MCP-served skills directly, but it means you get the benefit today instead of waiting for the spec to land.

And my own work is part of that unfinished picture. The pull requests linked here are experimental reference implementations, written to explore the draft and feed findings back to the working group. Most of them are still open, several pieces are deliberately left out, and none of it is a stable product you should depend on.

I don't see any of that as a weakness, though. It's exactly the position I want to be in: helping shape the standard alongside the people defining it, rather than waiting on the sidelines to consume it once it's done. If you read this and want to push it forward with us, even better.

## What's next

There's still plenty to do. The spec keeps moving, the reference implementation has gaps to fill, and the polyfill is an open task in its own right, with a dedicated follow-up post coming.

If any of this sounds interesting, the working group is open, and so are all of the pull requests below. Come say hello.

## Links & resources

- **Mate Symfony bridge Skills**: [symfony/ai#2132](https://github.com/symfony/ai/pull/2132)
- **Reference implementation in the PHP MCP SDK**: [php-sdk#372](https://github.com/modelcontextprotocol/php-sdk/pull/372)
- **Filesystem polyfill (skills:install)**: [symfony/ai#2213](https://github.com/symfony/ai/pull/2213)
- **The spec**: [SEP-2640: Skills Extension](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2640)
- **Working group repo**: [experimental-ext-skills](https://github.com/modelcontextprotocol/experimental-ext-skills) (+ doc-drift fix [#98](https://github.com/modelcontextprotocol/experimental-ext-skills/pull/98))
- **SKILL.md format**: [agentskills.io](https://agentskills.io)
- **Background**: [my Symfony Mate talk recap](https://www.linkedin.com/posts/wachterjohannes_symfony-php-ai-ugcPost-7474517649868283904-Inz_/)
