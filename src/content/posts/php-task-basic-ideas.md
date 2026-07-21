---
title: "PHP-Task: Basic Ideas"
description: "The basic ideas behind PHP-Task: scheduling and running tasks inside a Symfony application itself."
pubDate: 2017-03-24
category: "// ARCHIVE"
readingTime: "2 min"
tags: [php, symfony, php-task]
archived: true
source: "https://asapo.at/blog/php-task-basic-ideas"
draft: false
---

In the year 2015 I had the idea that symfony applications should be able to schedule and run tasks in the environment of the application itself.

After a few days of research I only found some wrapper for [Gearman](http://gearman.org/) or other task-runner. But all of this had a one main problem, the developer is not able to schedule tasks in the future. Besides of that this task-runner all needs to run additional software which has to be managed and maintained.

[PHP-Task](https://asapo.at/projects/php-task "PHP-Task") solves that problem by implementing all the parts in raw PHP, integration into symfony with a simple bundle and a storage layer for relational-database with [doctrine](http://www.doctrine-project.org/projects/orm.html).

## Core Concept

The main parts of the library consist of the "TaskScheduler" and the "TaskRunner". The scheduler manages tasks and create their executions. The runner fetches the pending executions and uses so called, handlers to execute them. These handlers are simple PHP-Classes which take the workload of the execution and returns a result. An example would be a [thumbnail generation task](http://php-task.readthedocs.io/en/latest/quick-example.html) - where the workload contains the filename and the handler returns the path to the generated thumbnail.

In a symfony environment the handler is a simple service which can uses other services inside the dependency-injection container. This enhances the developer to reuse application code without any overhead.

In a real world example the runner will be called in a fixed interval (something like 5 minutes).

## Success

A few weeks ago the project was released in the version [1.0.0](https://github.com/php-task/php-task/releases/tag/1.0.0). With this release PHP-task was integrated into Sulu. Read more about how the project is used there in the bog-post: "[New in Sulu: Automation](http://blog.sulu.io/new-in-sulu-1-5-automation)".
