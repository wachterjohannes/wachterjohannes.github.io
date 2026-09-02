---
title: "The last mile: distributing Agent Skills to real agents"
description: "The polyfill that bridges where the Agent Skills standard is heading and what agents can read today, and why distribution, not the protocol, was the real problem."
pubDate: 2026-07-09
category: "// BUILD"
readingTime: "9 min"
heroImage: "/images/posts/the-last-mile-header.png"
heroAlt: "The last mile: distributing Agent Skills to real agents. A terminal shows composer require and mate discover installing skills."
tags: [ai, skills, symfony, mate, mcp]
draft: false
linkedin: "https://www.linkedin.com/posts/wachterjohannes_theres-a-lot-of-discussion-around-mcp-right-activity-7480497144185978881-9sKs"
---

*By Johannes Wachter, core developer at Sulu. The follow-up I promised in [Skills over MCP](/blog/skills-over-mcp): the polyfill that bridges the gap between where the standard is heading and what agents can actually read today.*

## Where the last post left off

In *Skills over MCP* I got to the end of a fairly optimistic story and then had to be honest about the one thing that undercut all of it. By a Skill I mean a folder with a `SKILL.md` file that teaches an agent when, how and why to apply a specific piece of know-how. You can package that up, serve it over the same MCP connection as your tools, cache it with digests, and negotiate capabilities like a proper protocol. It's a nice design. And as of today, no mainstream agent will read a single byte of it.

Claude Code, Codex, GitHub Copilot and OpenCode all load Skills the same way: from the filesystem. They watch a directory, and whatever `SKILL.md` files live there become available. None of them speak the MCP Skills extension yet. So the cleaner half of the work, the part I was most proud of, has almost nowhere to run.

That gap is the whole subject of this post. The interesting engineering turned out not to be the protocol. It was the last mile: getting a skill out of a Composer package and onto the exact directory each agent is already looking at.

## The last mile problem

Here's the shape of it. Mate extensions ship know-how as Skills. A developer installs an extension with `composer require` and, ideally, the relevant Skills just show up for whatever agent they use, with nothing to configure and nothing to copy by hand.

The complication is that "whatever agent they use" is not one target. Codex, OpenCode and Copilot read from `.agents/skills/`. Claude Code only reads its own directory, `.claude/skills/`. Four agents, more than one convention, and one source of truth sitting in a vendored package that none of them will look inside. So the job is narrow and boring in the best way: mirror the skills a package declares into every place an agent expects, without the developer thinking about any of it.

## Why this matters: retiring the Maker

That sounds like plumbing, and mostly it is. But the reason I care about getting it right arrived as a conversation, not a spec. Around the same time I was putting together the first prototype, [Kevin Bond](https://www.linkedin.com/in/zenstruck/), who maintains Symfony's MakerBundle, reached out: he wants to step back from the Maker and replace it with Agent Skills. We had been circling the same idea independently, which is usually a good sign.

It makes a lot of sense to me. MakerBundle was always hard to maintain: at heart it's a code generator that has to encode every Symfony convention in PHP templates and keep chasing the framework as it evolves. Kevin has already written skills like `make-entity`, generalized so they aren't tied to one project or one agent, and by his account they work really well. The open question was distribution. Flex could deliver them, but that means standing up yet another path for getting AI context into Symfony apps. Mate gives us a single place to distribute AI things, tools and skills together, and eventually over MCP once agents can read them that way.

Looking back, the problem was never really installing files. It was distribution. Symfony already has mature ways to distribute code, through Composer, and configuration, through Flex. Agent Skills introduce a third category: distributing knowledge. Once I started seeing it that way, the polyfill stopped feeling like a workaround and started feeling like the missing piece, the thing that lets a Composer package carry know-how the same way it already carries code.

That reframes the whole effort. It is not about copying files, it is about how Symfony know-how moves out of generators and into skills the agent reads directly. We are still working out the exact shape, and I won't pretend it's settled. But that is what turns the Maker idea from a whiteboard sketch into something we can put in front of real projects now.

## How the polyfill works

An extension declares where its skills live with one key in `composer.json`:

```json
{
    "extra": {
        "ai-mate": {
            "scan-dirs": ["src"],
            "skills": ["skills"]
        }
    }
}
```

Every immediate subdirectory that contains a `SKILL.md` counts as one skill. That's the entire contract. No manifest to maintain, no registry to update. If the folder has a `SKILL.md`, it's a skill. This might grow later, templated or dynamically generated skills are an obvious next step, but for now it's deliberately the simplest thing that works: plain files, copied or symlinked.

From there `skills:install` does the mirroring. It installs the skills into `.agents/skills/`, which covers Codex, OpenCode and Copilot, and it symlinks them into `.claude/skills/` so Claude Code sees the same set from its own directory. One source, several destinations, kept in sync.

The part I care about most is that you almost never run anything yourself. The install is wired into `discover`, which already runs after `composer require`. So the intended experience is: you add an extension, and its know-how is simply there the next time your agent looks. No step to forget. That automatic path is the piece that already works, and I kept the first PR as small as possible so it could land cleanly.

Around that, the plan is to grow `skills:install` into a small family of commands for when you want control. It will likely get reshaped and renamed along the way, roughly toward this:

```bash
# Install a skill (symlinked to the vendor package, so it auto-updates)
$ vendor/bin/mate skill:install

# Take a local, editable copy instead of the symlink
$ vendor/bin/mate skill:overwrite some-skill

# Turn a skill off, or back on, without deleting it
$ vendor/bin/mate skill:disable some-skill
$ vendor/bin/mate skill:enable some-skill
```

The concept matters more than the exact names, which are still moving. By default a skill is symlinked to the vendor package, so it stays canonical and updates with `composer update`. You can take a local editable copy when you want to tweak one for your project. And you can disable a skill so the opt-out survives the next install instead of getting silently undone. Treat the commands above as direction, not a stable interface to script against yet.

To keep all of this honest, the core Mate package ships a small built-in skill of its own, `system-information`. If the plumbing ever breaks, the package that defines the plumbing is the first to notice.

## It already works with skills I didn't write

The best signal came from outside the core. A community developer, fatonh, had independently built a repo of several Symfony convention skills, the kind that stop an agent making the same mistakes over and over: entities leaking into responses, N+1 queries, business logic in controllers. He pointed it at the polyfill branch, added `extra.ai-mate.skills` to his `composer.json`, ran `composer require`, and all of them symlinked into `.claude/skills/`. A third-party skills repo, from someone I've never met, flowed through the mechanism end to end with no special-casing. That's the test that mattered most.

The honest part of his write-up is the bit I liked even more. On a textbook N+1, the agent fixed the problem from Mate's profiler signal alone. The skill loaded, but it didn't change the outcome. That isn't a knock on skills, it's a reminder of the line I keep coming back to: better context beats more context. The profiler already knew the answer; the agent just needed to see it. The skill became valuable only where the runtime signal stopped being enough, and that is exactly where skills earn their keep, the JOIN-plus-pagination shaped problems with no single obvious profiler tell. Distribution and runtime truth are two halves of the same idea, and it was good to see them meet in someone else's project.

## Build the stopgap, then plan to delete it

There's a temptation, when a standard is still being written, to wait for it. Build the pure thing, keep it clean, and let people consume it once the working group is done. I understand the appeal, and I think it's the wrong call here.

A polyfill is an admission that the ideal isn't ready and people need the benefit anyway. The web platform has lived on them for years: you ship the future's API today, on top of what browsers actually support, and you retire the shim once they catch up. This is the same move for Agent Skills. The `skill://` resources and the MCP transport are where this is going. The filesystem install is how you get there before the road is paved.

What makes it honest is that it's designed to be thrown away. The moment agents read MCP-served skills end to end, `skills:install` has no reason to exist, and deleting it will feel like progress rather than loss. I'd rather ship code that carries an expiry date than make developers wait for a spec to finish before they get anything useful. A good polyfill is a promise to delete your own code later, and that's a promise worth making.

## What's next

The polyfill is up for review now, [symfony/ai#2213](https://github.com/symfony/ai/pull/2213). Like everything around this it will keep moving as the standard settles, with the serving half in the PHP SDK and the SEP-2640 discussion evolving in parallel. When the two ends finally meet, the fun part will be removing the bridge. So, no pressure to [Chris](https://www.linkedin.com/in/christopher-hertel/) and [Oskar](https://www.linkedin.com/in/oskar-stark/) reviewing it, but I'm obviously looking forward to seeing this land.

If you're building developer tooling in this space, I'd genuinely like to compare notes on the last mile. It's the least glamorous part of the problem, and so far the one that decides whether any of the rest reaches a real developer. Standards matter. But until developers can actually use them, they're still just standards, and the last mile is what turns a specification into something people build with.

## Links & resources

- **The polyfill (skills:install)**: [symfony/ai#2213](https://github.com/symfony/ai/pull/2213)
- **Predecessor post**: [Skills over MCP: shipping Symfony know-how with Mate](/blog/skills-over-mcp)
- **Community Symfony skills repo (fatonh)**: [github.com/fatonh/symfony-skills](https://github.com/fatonh/symfony-skills)
- **Symfony bridge skills content**: [symfony/ai#2132](https://github.com/symfony/ai/pull/2132)
- **Serving half in the PHP MCP SDK**: [php-sdk#372](https://github.com/modelcontextprotocol/php-sdk/pull/372)
- **The spec**: [SEP-2640: Skills Extension](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2640)
- **SKILL.md format**: [agentskills.io](https://agentskills.io)
