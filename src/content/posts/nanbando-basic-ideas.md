---
title: "Nanbando: Basic ideas"
description: "The basic ideas behind Nanbando, a simple backup CLI for PHP applications with pluggable backup strategies."
pubDate: 2017-03-25
category: "// ARCHIVE"
readingTime: "2 min"
tags: [php, nanbando, backup]
archived: true
source: "https://asapo.at/blog/nanbando-basic-ideas"
draft: false
---

Nanbando is a simple backup cli-application. It enhances the developer to easily configure backups and automate them via cronjob.

## Core Concept

The main part of the application is a phar file which contains all the dependencies which is needed to create a simple directory backup and push the to a remote storage.

But this is mostly not the whole story - most web applications also relies for example on a database which has to be included in the backup to be sure that the state of the application can be restored later. Another example is Sulu, which needs also to backup multiple parts of the jackrabbit repository.

This additional backup strategies - called plugins - can be installed via [embedded-composer](https://github.com/dflydev/dflydev-embedded-composer) - which is also integrated in the phar file. The simple json formatted configuration which contains the plugin-dependencies and backup parts will be stored in a file named "nanbando.json". This file can also be pushed to you repository and deployed to your live server.

On the server the phar is able to initialize the plugins and backups can be created or restored.

## Current state

The latest [0.8](https://github.com/nanbando/core/releases/tag/0.8.0) release contains most features which are neccesary for the final [1.0](https://github.com/nanbando/core/milestone/3) release. But there are lots of issues which has to solved before.
