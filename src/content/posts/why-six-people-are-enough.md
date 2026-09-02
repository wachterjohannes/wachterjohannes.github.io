---
title: "Why six people are enough and what coding agents have to do with it"
description: "Six developers run Sulu, its enterprise projects and its cloud services. That only works because of ownership and context, and those are exactly what coding agents need too."
pubDate: 2026-05-19
category: "// ESSAY"
readingTime: "8 min"
heroAlt: ""
tags: [ai, teams, ownership, sulu]
draft: false
linkedin: "https://www.linkedin.com/posts/quotes-2-share-7465771606288711680-yLdR/"
canonicalUrl: "https://sulu.io/blog/why-six-people-are-enough-and-what-it-has-to-do-with-coding-agents"
originalPublisher: "the Sulu blog"
---

How many people does it take to build an open-source CMS that enterprise customers run in production?

It sounds like a trick question. Most people I ask guess 20, 30, sometimes 50. The answer: there are six of us. Six developers (Thomas, Alex, Martin, Daniel, Patrick, and me) running multiple large-scale projects in parallel, embedded as experts in external agency teams, and building services like [Sulu.ai](https://sulu.io/ai) and [Sulu.cloud](https://sulu.io/cloud) on top.

This article has been in my head for a long time. What finally pushed me to write it down was [a German-language video by M. Bauhuber on YouTube](https://www.youtube.com/watch?v=H2Ox8undyEY) about coding agents and the cognitive debt they're producing across the industry. Watching it, I kept nodding along — not because the analysis was new to me, but because someone had finally put words to what I'd been thinking about for months. So credit where it's due: the framing in this piece owes a lot to that video. The lived experience behind it is ours.

It's also why I think we're unusually well positioned for what's coming with coding agents, and why the way small teams operate is worth a closer look right now — even for teams structured very differently today.

## What we actually mean by "full-stack"

When I tell people that every person on our team works full-stack, I usually get the same follow-up: "But how? Backend and frontend are two different worlds!"

The honest answer: yes, they are. And no, nobody is equally strong in both. By "full-stack" we don't mean that every person is an expert in everything. We mean that every person can think through and build a feature holistically — from the data model through the API and into the admin UI. And above all, that every person understands why a feature is being built.

This "why" is the real point. A full-stack developer, as we define it, doesn't just have technical breadth. They also have direct customer contact, know the business case, and can walk the customer through what a requirement will actually affect — adjacent features, the systems around it, the side effects worth flagging.

That replaces exactly the roles other teams staff with separate people: product owner, project lead, requirements engineer. Those tasks don't disappear. They sit with the person who's going to build the feature anyway.

Five things hold the team together: full-stack ownership, direct customer contact, clear areas of responsibility, self-organization, and a flat hierarchy. They only work as a system. Take away full-stack, and direct customer contact stops working.

## Why communication becomes the product in larger teams

Let me take a step back and explain something about classic team structures thathas always puzzled me.

If you put ten developers on a project, you have 45 possible communication edges, mathematically speaking. For everyone to know what the others are working on, information has to flow across all of them. With twenty people, you're already at 190. And the managers sitting on top of that aren't even counted yet.

What do you build to handle that? Jira tickets. Status meetings. Sprint reviews. Retrospectives. People whose main job is managing all that communication.

I'm not judging this. At that team size, it's necessary. But it comes at a price: communication becomes the product. And the friction of shipping a feature becomes enormous — meetings, alignments, handovers — before the first line of code gets written.

In a team of six where everyone is in the loop, those edges still exist. But there are fifteen of them, not 190. And they live in conversations that happen daily anyway, not in a ticket system.

## A quick note on who else is around us

I want to be honest about one thing before I go further: the six developers aren't the whole company. We work with Ninja, who runs operations and marketing for us — including coordination with external partners, content scheduling, event planning, and all the operational work that would otherwise eat into development time.

This matters for the argument. "Six developers do everything" would be misleading. The reality is that six developers can focus entirely on development because the non-development work is in good hands elsewhere. That split is part of why the model works.

It also tells you something more general. Small doesn't mean understaffed. It means the split between creation and coordination is drawn deliberately, not by org chart default.

## Where coding agents come in

Now for the part where all of this suddenly becomes very timely again.

Over the last few months, you can watch what happens when teams plug coding agents into their existing structure. Short version: it stutters.

The reason isn't that the agents produce bad code. They produce surprisingly good code. The problem is that they typically work with a narrow view of the codebase, and even when they can search broadly across files, they don't carry the why. They make locally optimal decisions and don't see the adjacent systems affected by the change.

In a distributed team structure with many handovers, this is devastating. The agent produces code that the reviewing human may not fully grasp, because they didn't have the original context in the first place. That's how cognitive debt grows: the widening gap between generated and understood code. The term comes from a [2025 MIT Media Lab study on LLM-assisted writing](https://www.media.mit.edu/publications/your-brain-on-chatgpt/), and while the original research was about writing rather than software, the dynamic translates almost directly to code.

In a small team with end-to-end ownership, the context still lives in the head of the person who's building. The agent isn't generating in a vacuum; it generates into an existing mental model. The review conversation with the machine is therefore structurally easier.

I don't want to overstate this. Small teams haven't automatically solved the problem. If you give six developers coding agents and remove reviews, you get the same cognitive debt — just at a smaller scale. But the starting conditions are better.

## Where it honestly hurts

It sounds too good to be true, and in some ways it is. There are real trade-offs.

If every person owns an area, every absence matters more. We try to compensate through overlapping expertise and clean in-code documentation. But a vacation or illness is more noticeable than it would be on a twenty-person team.

The model also doesn't scale linearly. Full-stack developers with customer contact who take ownership are senior profiles. You don't find them off the shelf. Growth is a slow, deliberate process for us — not "we're hiring ten people next month."

And very practically: "There are six of us" isn't a sentence that instantly excites enterprise buyers. We've had to explain, again and again, why it's not a bug but a feature.

Even so, when I look at what we deliver, in what timeframe, and at what quality, I wouldn't trade the model.

## A short anecdote that says a lot

A few weeks ago, we had a customer conversation that sums up where the industry currently stands. The customer said, very politely: "I've read that development costs will drop by 50% over the next few weeks because of AI. So I'd like to hold off on this project."

I'm not exaggerating. Almost word for word.

I want to give that statement a fair reading. The customer isn't wrong that AI is changing how software gets built. They're also not wrong to think about budgets carefully. The instinct is reasonable.

But the conclusion confuses two different things: the speed of producing code with the speed of producing working software. The first is collapsing. The second is not. What's getting harder is everything around the code — holding the bigger picture, validating that the agent's output actually solves the problem, making sure it doesn't quietly introduce cognitive debt that surfaces six months later.

And here's the thing I should have said more clearly in that conversation: we don't sell lines of code. We sell the team that picks up the phone at 11pm when something breaks. When a bug, a runtime failure, or an integration suddenly behaves differently, the question isn't "did an agent write this code?" The question is whether there's a human who understands this system, who knows what was shipped and why, and who can fix it now.

We can. That's what we sell.

## What this means for your team

Maybe you're reading this as a developer and thinking: sounds nice, but my team is set up very differently. Thirty people, Jira, Scrum, the whole thing.

That's okay. I'm not telling you to restructure your organization tomorrow. That's not my point.

My point is different. If you're experimenting with coding agents right now and it's stuttering, it's probably not just the agents. It's the structure you're plugging them into. And it might also be the codebase you're plugging them into.

The question I want to leave you with is therefore not "how do I use agents in my existing structure?" It's: which parts of my structure exist only because ownership is split across many heads — and which would survive if it weren't?

That's a different question. And it opens up answers that otherwise stay closed.

## An invitation

I'm curious how you see this. How big is your team? Are you already working with coding agents? Where does it stutter, and where does it run better than expected?

Write to me on LinkedIn, Twitter, or directly via GitHub. I read every message, and I think we can learn a lot from each other as a community right now.

Thanks for reading. See you in the next article.
