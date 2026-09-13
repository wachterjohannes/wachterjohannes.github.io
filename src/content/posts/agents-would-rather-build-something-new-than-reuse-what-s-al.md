---
title: "Agents don't reuse what they can't discover"
description: "A colleague's agent kept reinventing Symfony components that already existed. What shipped in response, and what a real benchmark found when the claim got tested."
pubDate: 2026-09-08
category: "// MEASUREMENT"
readingTime: "8 min"
heroImage: "/images/posts/agents-would-rather-build-something-new-than-reuse-what-s-al-header.png"
heroAlt: "Header: Built, not discovered. Writing new code is faster than finding what already works. A terminal card shows the benchmark's honest result: without the knowledge layer the agent reached for manual parsing, with it the agent used #[MapRequestPayload], while locking was already idiomatic in both arms. Footer: Benchmark, discoverability not intelligence."
tags: [ai, agents, php, symfony]
draft: false
---
*By Johannes Wachter, Sulu core developer and Symfony AI core team member.*

A while ago, a member of the Symfony core team, Alexander Turek, ran a small
experiment: he built a couple of fresh Symfony applications with an agent from scratch,
mostly to watch which technical decisions it made on its own. He fed it requirements and
deliberately stayed out of the way, curious what it would do without being told.

The same pattern kept showing up. Asked to build an API, the agent parsed the request
payload with `json_decode()` and wrote its own validation logic by hand, until Alex stepped
in and asked why not Serializer and Validator. Later, building a feature that needed mutual
exclusion, it wrote its own locking mechanism before he pointed it at `symfony/lock`. When
he needed a series of webhooks and asked whether Symfony's Webhook component could help,
the agent talked him out of using it.

The easy read is that the agent didn't try hard enough, or that it doesn't really know
Symfony. Neither survives a closer look. Alex hadn't stripped anything down or fed it
minimal instructions. The agent had already recognized the project as Symfony: it wrote
controllers, used attribute-based routing, structured the code the way a Symfony project is
supposed to look. It just kept treating already-solved problems as new ones, quietly, three
times in a row, in three completely different parts of the framework.

## The agent knew Symfony. It just didn't know what Symfony already solved.

The agent clearly knew Symfony. What it failed to surface were specific capabilities inside
Symfony that already solved the problem in front of it: `symfony/lock` for mutual exclusion,
`#[MapRequestPayload]` for validated JSON, the Webhook component for the webhooks Alex asked
about. Generating fifty lines of locking logic is cheap and immediate. Knowing that
`symfony/lock` exists, and that it already handles the edge cases a hand-rolled flag will get
wrong under real concurrency, is a different problem: the agent has to surface that fact
before generating the replacement. The problem wasn't that the answer didn't exist. It was
that generation was cheaper than discovering it.

Software ecosystems have spent decades building ways for humans to find this kind of fact:
documentation, package registries, Stack Overflow threads, a colleague who's seen the
problem before. None of that was built with an agent's context window in mind, and an agent
with a limited budget for exploring rarely goes looking on its own. Symfony is the concrete
case here, but the same question applies anywhere a mature ecosystem meets a coding agent
that has to guess what already exists instead of being told.

## The same evening, a pull request

The conversation about Alex's experiment didn't stay theoretical. The same evening, I opened
[a pull request against `symfony/recipes`](https://github.com/symfony/recipes/pull/1563) to
add a short `AGENTS.md` to the `framework-bundle` recipe, so new Symfony projects using that
recipe get one from the start. It merged a week later. The file doesn't try to teach an agent
Symfony from scratch. Among the conventions it spells out are the specific facts that kept
tripping models up: reach for `symfony/lock` before hand-rolling
mutual exclusion, bind request data with `#[MapRequestPayload]` instead of manual
`json_decode()`, use Flex to install a new capability instead of hand-editing
`config/bundles.php`. Policy alone doesn't close this gap. Telling a model to "prefer
existing components" restates something it may already believe about itself. Telling it
which component, and that it's one `composer require` away, adds the fact that was actually
missing.

## Does stating the fact change anything?

Shipping the recipe only proves that the fact can be written down. Whether writing it down
changes what an agent actually does needed an actual test, not an assumption. So I turned to a
different, more controllable mechanism: not `AGENTS.md` itself, but a matching set of
"skills", agent-readable files that overlap with the conventions the recipe now ships. They're
a working prototype built for this benchmark, not a finished package, and I haven't decided
yet whether or how they'll be maintained or distributed further. I built
a small set of Symfony coding tasks and ran [a small benchmark](https://github.com/wachterjohannes/symfony-skills/blob/main/benchmark/RESULTS.md),
running each task twice on a fresh project, once with the skills installed and once without,
and comparing what came back.

## What the benchmark showed

The result lined up with what Alex saw by hand. Given a task that needed a validated JSON
endpoint, the agent with the skill installed reached for `#[MapRequestPayload]`
consistently. Without it, manual parsing was the dominant pattern across the model
configurations I tried. The effect wasn't universal: on a couple of the tasks,
the strongest models already wrote idiomatic code whether the skill was there or not,
meaning the gap Alex noticed doesn't apply evenly across every model or every kind of
problem. The benchmark also caught a mistake in the skill: on one task, the agent kept adding an
extra layer of error handling on top of what `#[MapRequestPayload]` already provides for
free, a habit the skill file itself was wrong to leave uncorrected until the numbers pointed
at it. Exact figures for all of this are in the appendix. The harness, raw setup and
consolidated results are public.

## The next problem: which Symfony?

Shipping the recipe doesn't close the question, though. The moment a file like `AGENTS.md`
ships, the next one opens right behind it: how long does it stay true? A project created on Symfony 8.1 may later move
to 8.2 while the instruction file stays where it is. Doctrine may get added or removed. API
Platform, Messenger or Lock may show up later. Framework recommendations change.

The recipe already tries to answer part of this, by telling the agent to check
`composer.json` and `symfony.lock` rather than assume anything is present. That covers
project state. It doesn't cover the other kind of drift: what the ecosystem itself considers
the right answer as it keeps evolving. First the missing thing looked like an instruction
file. Now the instruction file looks like just another cache, and caches go stale.

## The same shape, one layer up

That's the same shape as the argument I keep making about giving AI better context instead
of more of it, just one layer up. Down at the level of a single running application, the
problem is making sure an agent knows what already happened on the last request instead of
re-deriving it from source code. Up here, it's making sure an agent knows what an entire
ecosystem already provides instead of re-deriving it from first principles. Symfony is the
example I can actually test. The same gap exists wherever a mature framework meets a
coding agent whose knowledge of it is already a few months stale: Laravel, React, Kubernetes,
any codebase old enough to have already solved the problem in front of the agent.

Agents don't need to get better at reinventing things. They're already good at that, which is
exactly why this keeps happening: generating a plausible replacement is now cheap enough that
it never forces the question of whether one already exists. The next job for mature
ecosystems is making the answers they've already built easy enough to find that an agent
reaches for one before it starts generating a fiftieth implementation of a problem someone
already solved.

The same rule applies here: when generating code is cheaper than learning and reusing what
already exists, the cost doesn't disappear. It moves into maintenance, and the wheel gets
reinvented, again and again.

## Appendix: the numbers behind the skills benchmark

Four benchmark iterations, 2026-08-29 to 2026-08-31, each fixing a flaw the previous one
exposed. Across three independent Opus samples of three repetitions each, the skill arm used
`#[MapRequestPayload]` in all nine runs while the no-skill arm used it in none. A fourth Opus
sample, part of a wider run testing five models (Opus, Sonnet, Haiku, Kimi K2.7, DeepSeek V4),
produced the first exception: one no-skill run reached for the attribute on its own, and the
effect held directionally across the other four models. Two tasks,
a voter-based authorization check and a lock command, came back 12/12 in both arms: the
stronger models already wrote idiomatic code there without being told, which is worth reading
as "this particular skill may not be earning its context cost" rather than a failed
test. A plain-PHP control task with no matching skill showed no consistent difference
between arms, confirming the setup itself wasn't producing the effect. The `#[MapRequestPayload]`
run also surfaced a real defect in the skill file: with the skill installed, the agent kept
adding a redundant `ValidationExceptionListener` on top of an attribute that already returns
422 with the validation errors. The skill's own instructions were rewritten to say so.

## Links

- [symfony/recipes#1563](https://github.com/symfony/recipes/pull/1563), the `AGENTS.md`
  addition to the `framework-bundle` recipe
- [wachterjohannes/symfony-skills, benchmark/RESULTS.md](https://github.com/wachterjohannes/symfony-skills/blob/main/benchmark/RESULTS.md), the benchmark referenced above
- [What happens to innovation when implementation becomes almost free?](https://johanneswachter.dev/blog/when-implementation-becomes-free/), the cost side of generation getting cheap
- [Vibe coding is no-code without a custodian](https://johanneswachter.dev/blog/vibe-coding-without-a-custodian/), who owns what an agent generates after launch
- [The hardest code to delete is your own](https://johanneswachter.dev/blog/the-hardest-code-to-delete/), what it costs to actually remove what got reinvented
- [How I Made Symfony's Maker Agentic](https://johanneswachter.dev/shorts/the-bug-agents-kept-finding-in-symfonys-makers/), fixing the underlying makers instead of just telling agents to route around them
