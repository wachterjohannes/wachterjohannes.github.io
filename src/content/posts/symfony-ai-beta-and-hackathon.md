---
title: "Symfony AI 1.0.0-BETA1 and a hackathon to break it"
description: "Symfony AI has a first pre-release on the road to 1.0, and a four-week hackathon to find out what is still wrong with it. What changed and why now is the time to try it."
pubDate: 2026-10-27
category: "// SYMFONY AI"
readingTime: "3 min"
heroImage: "/images/posts/symfony-ai-beta-and-hackathon-header.png"
heroAlt: "Header: Break the beta. Four weeks to find what is still wrong with Symfony AI before 1.0 ships."
tags: [symfony, symfony-ai, mcp, php, ai, open-source]
draft: false
---

*By Johannes Wachter, Sulu core developer and Symfony AI core team member.*

Symfony AI reached its first 1.0 beta this week, and alongside it a four-week hackathon started. Christopher Hertel [announced both on the Symfony blog](https://symfony.com/blog/symfony-ai-1-0-0-beta1-ai-and-mcp-hackathon). I do not want to repeat his post, so this is the version from where I sit: what changed in the code I touch every week, and why the hackathon is part of the release rather than a side event.

<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:2rem 0"><iframe src="https://www.youtube-nocookie.com/embed/tDt3sDKkx_U" title="Symfony AI &amp; MCP Hackathon" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" loading="lazy" allow="encrypted-media; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>

## What the beta means

The feature set for 1.0 is settled, and from here the work is fixing rather than redesigning. The backward compatibility promise starts with 1.0.0 final, not with this tag. That has a consequence I find easy to overlook: if something genuinely has to move, this beta phase is the last cheap window to do it. After that, every mistake costs a deprecation cycle.

The official PHP MCP SDK is heading for 1.0 alongside it, and it is in scope for the same feedback.

```
$ composer require symfony/ai-bundle:^1.0@beta
```

## Three changes you will notice in your own code

The upgrade notes are long, and a lot of it is housekeeping. These are the ones I expect to show up in an application.

**The agent no longer changes your `MessageBag`.** It used to add the system prompt, the memory and the messages of the tool loop to the bag you passed in. Now the bag is immutable, and you keep the answer yourself:

```diff
 $execution = $agent->call($messages);
-$messages->add(Message::ofAssistant($execution->getResult()));
+$messages = $messages->with(Message::ofAssistant($execution->getResult()));
```

It is a small diff per call site, and it removes a whole class of surprises where a bag grew in ways nobody had asked for. The pull request notes that a growing bag had even returned stale answers from the cache platform.

**`AgentInterface::call()` returns an `ExecutionInterface`.** It reports its status, pending tool calls and errors through a proper execution object. I read that as groundwork for agents that can pause in the middle of a run and continue later. I started this one in a pull request of my own, and Chris took it over and merged it as #2811, without the execution id in the message metadata, since nothing uses that yet. If you implement `AgentInterface` yourself, the return type is the change you have to make.

**The Chat component is gone.** Its message stores moved into the Agent component, and the `chat` option of the AI Bundle went with it.

On the store side, configuration also got less bridge-specific: setup options moved into normal store arguments, and `dimensions` and `metric` now use the same names across stores. Store and platform names also have to be unique.

I also contributed a few things there that you may meet in the beta: a store that mirrors Doctrine entities into any other store (#2795) and support for MariaDB vectors in the Doctrine store (#2800).

## What this costs

These changes break code, and that is exactly why they belong in the beta. The expensive version would be discovering after 1.0 that the execution model or conversation API is wrong and then carrying that decision through a deprecation cycle. I would rather pay for the break once now.

## Why the hackathon belongs to the release

A beta is only as good as the things people try to do with it. For four weeks, from 26 October to 22 November 2026, the hackathon pushes Symfony AI and the PHP MCP SDK with real projects. It is online, free, and you can go solo or in a team of two. There are no fixed topics. You hand in a public repository that anyone can clone and run, plus a 90-second video, by 22 November at 18:00 CET. The jury looks for a creative idea, a demo that really works, what Symfony AI and MCP let you do that you could not before, and code you would merge. Jury and prizes will be announced shortly, according to the hackathon site.

The feedback is the real point. Every real failure we can reproduce during the beta is one less surprise we have to preserve after 1.0. If something breaks, misbehaves or simply reads wrong at three in the morning, open an issue at [symfony/ai](https://github.com/symfony/ai/issues) or at the [PHP MCP SDK](https://github.com/modelcontextprotocol/php-sdk/issues).

Registration and the rules are at [symfony.com/hackathon](https://symfony.com/hackathon).
