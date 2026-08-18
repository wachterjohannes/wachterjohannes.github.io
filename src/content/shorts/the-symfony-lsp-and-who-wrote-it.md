---
title: "The Symfony language server, and who wrote it"
description: "Symfony's new official LSP server ships with a disclosure most projects still keep private: most of the code was written and reviewed by AI models."
pubDate: 2026-08-17
tags: ["symfony", "ai", "open-source"]
source: "https://symfony.com/blog/announcing-symfony-language-tools-the-official-symfony-lsp-server"
lang: en
---

Symfony released an official language server this week. Buried past the feature list: Fabien
writes that most of the code was written and reviewed by AI models, mainly Claude Fable 5 and
GPT-5.6 Sol.

What stays with me isn't the tooling, it's what he says stayed with him: the architecture, the
scope of each feature, and the final word on every change. Plenty of projects work this way
right now, and almost none say so in the release notes, let alone name which part the human
kept. He backs the claim with something checkable rather than just an assurance: an extensive
test suite and performance benchmarks, not just a promise. AI-assisted code is
already part of Symfony repositories, and that stopped being the interesting question a while
ago; what matters is whether someone is responsible for it and treats that responsibility
seriously. Who wrote a line is becoming a less useful question than who answers for it.
