---
title: "The Mate Journey: how an idea became a tool"
description: "The origin story of Symfony Mate, from a moment of quiet rivalry at a conference to a prototype built on a train with no internet connection."
pubDate: 2026-10-05
category: "// MATE"
readingTime: "6 min"
heroImage: "/images/posts/mate-journey-header.png"
heroAlt: "Title card: 'Built on a train.' A terminal labeled 'Amsterdam → home' shows git init debug-mcp, composer install, the note 'no signal on the train…', and two checks: opencode (local model, works), 138917f (bootstrap commit). Footer: 'Origin story · Amsterdam, a train, and Berlin.'"
tags: [symfony, mate, ai, open-source]
audio: "/audio/mate-journey-podcast-de.mp3"
linkedin: "https://www.linkedin.com/posts/wachterjohannes_before-symfony-ai-was-announced-i-stood-share-7512756576466677760-L7Nf/"
audioLabel: "Spoken companion to this post, 8 min"
draft: false
---

*By Johannes Wachter, Sulu core developer. The origin story behind Symfony Mate, from a moment of quiet rivalry at a conference to a prototype built on a train with no internet connection.*

It is a strange feeling to sit in a conference audience and watch someone present a version of the thing you already built. A year before SymfonyCon Amsterdam, I had stood on a similar stage in Vienna and talked about my own library, Modelflow-AI. It already had the clean provider abstraction. It was already moving toward routing and tooling. So when Symfony AI was announced in July 2025 covering a lot of the same ground, my first reaction wasn't excitement. It stung. I had spent a year building in that direction already, and seeing a larger project arrive in the same space made me feel passed over, even though nobody had actually taken anything from me.

I went to Amsterdam still carrying that. I left with a different problem entirely: what to build together.

## The talk that reframed the question

Fabien's keynote that day wasn't a roadmap for agentic coding, and he made a point of saying so. What stuck with me was something more basic: Symfony already exposes a lot of information that is tedious for a person to inspect but extremely useful to a model. Container tags, route lists, CLI output, profiler data. In his words, it was "gold for an LLM."

I had already been circling around the same idea. Hearing it from the stage did not give me the idea, but it told me the shape was worth pursuing. And when Fabien pointed to Christopher Hertel and Oskar Stark in the audience and made clear that Symfony AI was their community effort, not his project, it also changed how I looked at the overlap with Modelflow-AI. It still took the rest of Amsterdam to turn that into a decision.

I already knew Chris. What eased my skepticism was talking to him about Modelflow-AI itself, not about merging efforts in the abstract. What tipped it was a separate conversation with Tobias Nyholm, about Fabien's talk and about an early idea for an MCP development server, which didn't even have a name yet: a concrete shape for the thing Fabien had just described from the stage. Tobias had just given his own talk, "Make Your AI Useful with MCP," and was genuinely excited about it. That's the point where defending two competing libraries stopped making sense.

## A surprise, not a proposal

Some of what Modelflow-AI already did well was prompt templating, the same thing Fabien had just pointed at from the stage as something that was still missing in Symfony AI. On the second day of the conference, instead of writing up a proposal, I just built it: [a pull request that brought template rendering into symfony/ai's Message API](https://github.com/symfony/ai/pull/1017), done quietly and posted without much warning. Chris's reply was short. He didn't have time to look properly during the conference, but he thought it was cool that I'd just started. That code is still there today, folded into the platform rather than kept as its own component, and it's grown well past what I shipped that day. You can template a prompt with Twig now. That set the pattern for everything that followed: show up with something that already works, don't wait for permission to start.

## A prototype with no internet

That pull request had nothing to do with what would become Mate. It was a first step into contributing to symfony/ai directly. Mate started as its own thread, running in parallel.

The first version of what would become Mate didn't have a name yet. It started as [a thin wrapper around the mcp/php-sdk](https://github.com/wachterjohannes/debug-mcp), with a small extension system built around it, started somewhere between the conference venue and the airport and continued on the flight home. By the time I boarded a train through Switzerland, I could run it, though not prove it worked: there was no internet connection on that train, so I tested it with an agent, opencode, talking to a local model instead. It worked, which was reassuring, but that only proved it worked with one agent and a local model, not with something like Claude or Codex.

The real test came a few days later, at home, with the agent setups I actually wanted Mate to work with. By then Tobias and I had already talked it through on the phone, and a small Slack thread with Chris had formed around how to fold this into symfony/ai properly. The first working version exposed Symfony's service definitions and its logs through Monolog, not the profiler yet; that part of Fabien's idea took a few more weeks to land. It was enough for an agent to get a real, structured view of a running application instead of guessing from source code alone. The version that eventually [landed inside symfony/ai as its own component](https://github.com/symfony/ai/pull/1146) came later still, considerably more mature than what I'd shipped on that first trip home.

## When it stopped being mine

I built the first prototype for myself, or at most for the three or four people talking about it on Slack. Somewhere in the months after, that stopped being true. By early October 2026, Packagist had counted more than half a million installs. That is not half a million users; CI, updates and repeated installs count too. But more than a quarter of those installs had happened in the previous thirty days, and I'd already started thinking differently about the people relying on it long before it got this big, back when the number was much smaller. I started writing more carefully. I started thinking harder about what it meant to change a tool on a whim once other people had already built on top of it.

The clearest proof that it had become something real came at [SymfonyLive Berlin in April 2026](https://github.com/wachterjohannes/symfony-mate-berlin), where I demoed Mate finding an N+1 query problem through Symfony's profiler instead of guessing from the source. Nicolas Grekas missed the live talk, so I walked him through the idea afterwards at the townhall: why an external, decoupled tool made more sense than putting this inside the profiler itself, and why Mate could not simply be another bundle. He got it quickly once he saw the concrete result instead of the pitch.

Two months later he finally saw the recorded talk at SymfonyOnline, while I joined the Q&A remotely from Tuscany. By then Mate no longer needed the original pitch to make sense.

## What I'm not retelling here

Two decisions that came out of this same period deserve their own space rather than a paragraph each here. Moving Mate from an MCP server to a native CLI, and why that mattered more than it sounds, is [its own piece](/blog/kill-the-mcp/). Getting Skills onto the filesystem before any mainstream agent could read the MCP extension for them, and the conversations with Kevin Bond that came out of it about retiring parts of the MakerBundle in favour of Skills, is [another one](https://www.linkedin.com/pulse/last-mile-distributing-agent-skills-real-agents-johannes-wachter-trdif/). Both threads trace back to the same prototype from the train, they just deserved more room than a sentence.

## Open source is a team sport

This whole thread worked because people building overlapping things in parallel noticed each other and stopped competing for the credit, not because I had a better idea than symfony/ai or gave up my own. Modelflow-AI gave me a head start I could bring to the table. Amsterdam gave me people willing to sit at it. Everything after that was mostly showing up with working code instead of asking whether I was allowed to.

Modelflow-AI did not become wasted work because Symfony AI existed. The parts that survived contact with other people's work became more useful than the library I had been protecting. Prompt templating is one concrete example. Mate is another, more indirect one.

The version of an idea that survives contact with other people's work is usually better than the one you had alone.

This thread led somewhere I didn't expect in August 2026: Chris asked me to join the Symfony AI Core Team, alongside him, Fabien, and Oskar Stark. That part is [its own piece](/blog/symfony-ai-core-team/). Mate itself keeps moving, and this story isn't finished yet.
