---
title: "Symfony Language Tools stopped taking patches"
description: "Symfony's new Language Tools repository closed its pull request tab. Contributors now start with an issue instead. Maintainers turn selected issues into code, usually with a coding agent doing much of the implementation work. Fabien's reasoning is what stuck with me."
pubDate: 2026-08-25
tags: [symfony, open-source, ai]
source: "https://symfony.com/blog/experimenting-with-issue-first-open-source-contributions"
lang: en
---

Symfony's new Language Tools repository closed its pull request tab. Contributors now start
with an issue instead. Maintainers turn selected issues into code, usually with a coding
agent doing much of the implementation work.

Fabien's reasoning is what stuck with me. An agent can usually produce the implementation
quickly; understanding the problem is what actually takes time, and that understanding is
usually deepest in whoever hit the bug. As a maintainer I recognise that trade immediately. A precise
bug report, naming the exact editor and version, plus whatever local configuration mattered,
has always been worth more to me than a diff I first have to unpick to find the real problem
underneath it.

It still makes me a little sad. Contribution is what makes open source communities work, and a
merged pull request still means something: your name in the changelog, proof you were part of
it.

The part I keep circling back to isn't really the pull request tab, though. It's responsibility.
Making code this cheap to produce doesn't automatically make anyone responsible for seeing it
through. I see
both sides of that already in symfony/ai: pull requests that are obviously AI-generated,
including some of mine, where the person behind them stays in the conversation and sees the
concept through, and others that are fire-and-forget, oversized, dropped as if writing the diff
were the whole job.

Closing pull requests to outsiders doesn't remove that responsibility problem. It moves more of
it onto the maintainer. I think I would rather keep contributors in the loop: issue first, then
a pull request once someone is actually taking responsibility for seeing it through.

What I'm less sure about is how either model scales. If contributors provide the problem and
maintainers own the whole path from there to implementation, the bottleneck moves away from
typing code and toward understanding, prioritising and validating what should actually be
built.

For a repository built with agents from the start, closing the pull request tab might still be
an honest description of where the work has moved.
