---
title: "Synapse, finished: a second brain with Symfony AI and MCP"
description: "The finished Synapse project in one video: notes that agents write and read, an MCP server behind OAuth, a second brain to ask, and what I ran into on Symfony AI 1.0.0-BETA1."
pubDate: 2026-11-20
category: "// SYMFONY AI"
readingTime: "2 min"
heroImage: "/images/posts/synapse-finished-second-brain-symfony-ai-header.png"
heroAlt: "Header: Synapse, part seven. The finished project, in one video."
tags: [ai, symfony, php, mcp, hackathon]
draft: false
---

Every branch of the tutorial series did one thing and left the rest out on purpose. The last branch is what the project looks like when I stop leaving things out. This is not a seventh tutorial. It is the finished state, in one video.

I built it for the [Symfony AI and MCP hackathon](https://symfony.com/hackathon/projects/synapse), and it is published there with this video. It is the project from start to end:

<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:2rem 0"><iframe src="https://www.youtube-nocookie.com/embed/XTMbkaW4fuM" title="Synapse: a second brain with Symfony AI and MCP" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" loading="lazy" allow="encrypted-media; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>

## What is in it

Synapse is a folder of markdown notes in the Open Knowledge Format. A capture agent writes to it, a read agent answers from it and names the file it used, and other tools reach it over MCP, behind an external authorization server with a read role and a write role. `app:federate` asks a second brain over MCP and ranks both answers together. A page in the browser shows the notes by status and answers questions word by word. A person sets the status of a note, and no tool of the agents can. Cohere is the default provider, Hugging Face is one variable away.

## What I ran into upstream

Building this on Symfony AI 1.0.0-BETA1 and the PHP MCP SDK showed a few gaps, and each has an issue, three of them mine:

- [symfony/ai#2968](https://github.com/symfony/ai/issues/2968): the MCP bundle does not always register the reference handler as a service, which is why the guard from part 5 needs a compiler pass.
- [symfony/ai#2853](https://github.com/symfony/ai/issues/2853): the session store and the notification bus of the bundle are built on PSR-16 only.
- [symfony/ai#2846](https://github.com/symfony/ai/issues/2846), reported by Tyler Shuster and fixed in [#2848](https://github.com/symfony/ai/pull/2848): a tool without arguments is sent without `parameters`, and the Hugging Face router answers 422.
- [symfony/ai#3007](https://github.com/symfony/ai/issues/3007), with [#3008](https://github.com/symfony/ai/pull/3008): a streamed tool call can fail with "Undefined array key name" when a provider sends the name after the id. I saw it once on the Hugging Face router.

I now sit on the other side of these issues. So far the person who reads them is also the person who wrote them, which makes the replies very fast and very polite.

## Try it

The code is in [wachterjohannes/synapse](https://github.com/wachterjohannes/synapse). You need PHP 8.4, Composer and one key, and the README takes you from clone to a page you can ask questions on. It comes with a test suite, and `app:doctor` tells you what is missing on first start.

It is a single-user tool for your own machine. Every call to a model is paid, your notes leave the machine when they are indexed, and a note can contain text that talks to the model. It runs on BETA1, so I expect small changes when 1.0.0 ships. I will update the series and the code again then.

If you try it, tell me what breaks. The hackathon also produced more than 50 other projects, worth a look if you want to see what else came out of it.
