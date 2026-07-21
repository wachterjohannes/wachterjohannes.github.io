---
title: "Pucene: Vision"
description: "Why I started Pucene: an attempt to reimplement Lucene and Elasticsearch concepts in pure PHP, and where the idea came from."
pubDate: 2017-03-26
category: "// ARCHIVE"
readingTime: "2 min"
heroImage: "/images/archive/pucene-vision-cover.png"
heroAlt: "Pucene: Vision"
tags: [search, php, pucene, elasticsearch]
archived: true
source: "https://asapo.at/blog/pucene-vision"
draft: false
---

Open-source projects often come to the point where they have to decide if they want to rely on a third party product like elasticsearch to realize a search. Also Sulu had already reached this point.

There we had decided to implement a simple abstraction layer ([MassiveSearchBundle](https://github.com/massiveart/MassiveSearchBundle)) which allows the developer to decide if he wants to use [zend-search](https://github.com/zendframework/ZendSearch) (raw PHP) or index the data in [elasticsearch](http://www.elastic.co/de/).

But this abstractions has a big disadvantage we rely on the highest common factor between [zend-search](http://github.com/zendframework/ZendSearch) and [elasticsearch](https://www.elastic.co/de/). This is the reason why the bundle only allows searching for [Lucene queries](https://lucene.apache.org/core/2_9_4/queryparsersyntax.html) and index very simple data-structures.

Another problem we have currently is that zend-search is quite "sleepy" since a long time. So we searched for an alternative implementation of indexing and searching - based on lucene - since a while.

> "Search is something that any application should have."  
> [Shay Banon](https://www.youtube.com/watch?v=fEsmydn747c)
> - Creator of Elasticsearch

## Idea trigger

In January this year I passed the training [CoreDeveloper](http://blog.sulu.io/core-elasticsearch-developer) for elasticsearch. The training was offered by elastic and hold in Munich. After the 2 days of hearing how elasticsearch works - I was really motivated to see how far I can get with reimplementing Lucene and the additions which elasticsearch provides.

After a few hours reading the [Lucene](http://lucene.apache.org/core/6_4_2/index.html) and [elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html) documentation I have started a few tests and see that the basic analyze, index and search process is quite easy to implement.

This was quite amazing to see. In the discussion with the Sulu-team we realize that this could be a solution for all our problems.

## Current State

The current state I have already reached is that we are able to analyze, index and search documents. Also scoring is implemented in a very Hacky way.

In one of the next blog-posts I will give some more internals about scoring algorithm in elasticsearch and how I want to achieve that in pucene.
