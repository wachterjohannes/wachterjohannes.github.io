---
title: "Vibe coding is no-code without a custodian"
description: "Vibe coding can produce maintainable software. The harder question is who owns its dependencies, decisions and failures after launch."
pubDate: 2026-07-28
category: "// OPINION"
readingTime: "9 min"
heroImage: "/images/posts/vibe-coding-without-a-custodian-header.png"
heroAlt: "Ownership. Who checks the roof. Vibe coding, the second act nobody posts. A card shows a timeline: day 0 shipped it, day 30 users love it, month 6 empty."
tags: [ai, vibe-coding, ownership, maintenance, opinion]
draft: false
---

*By Johannes Wachter. Part of Ownership, a series about who carries the consequences once implementation stops being the hard part.*

## The story always ends at the launch

My feed is full of the same post. Someone built a SaaS product on a train. Someone replaced a tool that cost them thirty euros a month in an afternoon. Someone shipped an internal system over a weekend without writing a line of it themselves. The screenshots are real, and the results are often genuinely impressive.

What I have never seen is the same person, six months later.

There is no follow-up. Nobody posts about the Tuesday a dependency reached end of life, or the security advisory that arrived on a Sunday, or the morning the payment provider deprecated the API the whole thing was built on. The genre has a first act and no second one, and the missing act is where most of my working life happens.

## This is not the first attempt

We have been trying to build software without software developers for as long as I have been in this industry. Excel and Access came before my time, but I still regularly encounter what they left behind in my work: spreadsheets and databases quietly running a business years after whoever built them has moved on. Then low-code, then no-code. Every wave promised applications without development knowledge, and every wave found its ceiling somewhere.

Vibe coding is the next attempt, and it pays to read the term as it was coined. When Andrej Karpathy [named it in February 2025](https://x.com/karpathy/status/1886192184808149383), forgetting was part of the definition: give in to the vibes, embrace exponentials, and forget that the code even exists. That is not a distortion by critics. It is the original description.

I have never liked no-code, and it took me a while to say precisely why. It is not the low ceiling and it is not the aesthetics. It is that no-code moves the code and the knowledge about it out of your hands, and leaves you depending on somebody else to look after both.

That dependency is real, but it is also a deal. Somebody is paid to resolve the dependencies, to hold the specification, to ship the update when the platform shifts underneath, and to answer the phone when it breaks at nine in the morning. You gave away control, and in exchange you got a custodian.

By custodian I mean whoever has the lasting access, context, authority and obligation to keep a system working after launch. That does not have to be a traditional developer, and it may not always have to be human. It can be a vendor, an internal platform team, a maintenance contractor or an open-source maintainer. One day, perhaps, it could be an agent operating under a mandate.

In the world I work in, that role usually has names attached to it: Fabien Potencier, Nicolas Grekas, Kevin Dunglas, Nils Adermann, Jordi Boggiano, and many others across the Symfony, PHP and Composer ecosystem. These are not abstract platforms maintaining themselves. They are people who keep showing up after the release. My own team is on that list too. The Sulu core team is the custodian for a long list of projects that depend on it, whether the people running them know our names or not. What matters is not who holds the role. It is that the role exists at all.

Vibe coding makes the same move and quietly drops the second half of the deal.

## Nobody says out loud who takes over

Nobody is explicitly responsible for resolving the dependencies. In the cases that worry me, the specification exists only inside a chat history. Nobody has agreed to decide whether last week's update is safe to apply.

This is also where I would separate vibe coding from agentic engineering, which get treated as the same thing far too often. The split is not developer versus non-developer. It is what happens around the code afterwards. Is there a specification outside the chat history? Are changes reviewed and tested? Can the system be deployed the same way twice? Is anyone accountable when it fails? The tools can be nearly identical. The responsibility around them is not.

## The code is better than the cliché

The obvious objection is that AI-generated code is a mess. I do not think that objection is strong enough to carry the argument.

David Tielke recently looked at five or six vibe-coded projects from the field. In [a video](https://www.youtube.com/watch?v=Nou5E4ne5NU), he concludes that he could have maintained the systems himself, even when the managing director who had commissioned one of them could not name the language it was written in.

I take that seriously, and it makes my argument narrower. If the case rested on bad code, one good counterexample would end it. It does not rest there. A well-structured system with nobody responsible for it is still a system with nobody responsible for it.

## What the custodian actually does

The work that never appears in the launch post is the work I know best. Keeping Sulu alive across major versions, contributing to symfony/ai, maintaining software while everything underneath it moves.

It looks like this. A library stops receiving security fixes, and its replacement has a different model of the world. A framework deprecates the thing your architecture leaned on, and you have a year and a half to reshape that assumption. A requirement changes for the third time, and the system still has to hold together while you find every place the previous assumption leaked into. Somebody has to know why that odd-looking line exists before deleting it, because it was a bug fix at three in the morning that nobody wrote down.

None of this photographs well. It happens long after the applause, it is invisible from the outside, and it makes up a large part of the job.

## The baker is not the problem

Picture the case that actually worries me. A baker replaces the point-of-sale system in his shop, because the vendor raised the price again and the export he needs has never worked properly. He describes what he wants, and by the end of the evening he has something that does exactly what his shop needs and nothing more. For a while it is better than what he had.

He is not being naive. He is making a rational decision, and the vendor he left has its own catalogue of failures: lock-in, price rises, end-of-life notices, the acquisition after which nothing gets fixed. Tielke describes the same movement one size up, with companies replacing standard systems to escape licence costs.

Neither option is free. That is the part worth saying out loud. One of them charges rent for a custodian, the other hands you the role and does not mention it. Nobody tells the baker that the bill arrives later, as time, attention and knowledge of a system he may not be able to inspect or repair independently.

## What would have to be true

I am not going to end with advice to leave the tools alone. They are useful, and telling people to stop is neither honest nor effective.

The interesting question is what a setup looks like in which the custodian role does not vanish. I see the shape of an answer from where I work. Sulu is a platform too. It gives you a stable core with clear interfaces, and lets you build your own application on top, inside a harness we own, which constrains the structure and enforces quality checks. When someone vibe-codes on top of it, that foundation is still covered, because a team is paid to maintain it. That only helps if the update actually reaches their installation. Sulu is open source, so a maintained core does not patch anyone's site on its own, and a vibe coder who never runs the upgrade is exactly as exposed as before. The responsibility did not disappear. It moved into the platform, but somebody still has to pull it down.

That matches the direction I keep arriving at from the other side. Much of what I build for coding agents follows the same principle: give them reliable access to the running system and make the relevant knowledge explicit instead of hoping they infer it. Different problem, same underlying move: keep the knowledge and the responsibility somewhere they can be found.

What I cannot answer yet is what the equivalent is for the baker. He has no platform team, and as far as I can see nobody is selling him a harness. That gap looks less like a warning and more like the product that is missing.

## The second act is still unowned

Building got cheaper, and that is a real gain, not something to be sour about. Maintenance may get cheaper too, as agents take on more of that work directly. What does not disappear on its own is ownership. Somebody still has to fund the work, schedule it, decide what gets deployed, and answer for the consequences when those decisions go wrong.

So when the next system arrives that somebody built in an evening, asking whether the code is any good is not enough. The question that follows is the one you would ask about a building:

Who checks the roof?
