---
title: "The repository was the easy part"
description: "GitHub spent almost eight hours on Monday returning errors across git operations, pull requests, Actions, Pages and Copilot. By the afternoon an Ask HN thread about alternatives to GitHub was on the front page with a few hundred comments."
pubDate: 2026-08-18
tags: [open-source, developer-tooling, ai]
source: "https://www.githubstatus.com/incidents/zkxwbgr0cnmx"
lang: en
---

GitHub spent almost eight hours on Monday returning errors across git operations, pull
requests, Actions, Pages and Copilot. By the afternoon an Ask HN thread about alternatives to
GitHub was on the front page with a few hundred comments.

What held my attention was the service list rather than the downtime. Hosting, continuous
integration, code review and the coding assistant now sit in one account and one failure domain,
and the assistant is the newest thing to have moved in there. GitHub's own postmortem names one
detail that makes the point sharper than I expected: VS Code's retry logic amplified Copilot
token traffic from a normal 7-9K requests per second to 70-100K during the outage. The assistant
did not just share the failure domain. Its retry traffic amplified the incident. The thread mostly discussed
moving repositories, which is the one piece that was always portable, because a git remote is a
git remote and a mirror takes an afternoon.

The parts that are genuinely hard to leave are the workflow files, the review history and
whatever the assistant has been granted access to. Nobody was shopping for those on Monday. That is why the answer to the
thread is usually "not really".
