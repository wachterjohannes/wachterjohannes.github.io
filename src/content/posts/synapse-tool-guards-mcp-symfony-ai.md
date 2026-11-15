---
title: "Guard every MCP tool by default in Symfony, and test all of them"
description: "Close every MCP tool to readers unless it says it is read-only, with a guard in front of the Symfony MCP server and a test that walks tools/list, so a new write tool cannot skip the check."
pubDate: 2026-11-15
category: "// SYMFONY AI"
readingTime: "7 min"
heroImage: "/images/posts/synapse-tool-guards-mcp-symfony-ai-header.png"
heroAlt: "Header: Synapse, part five. Every tool starts closed, a test walks them all."
tags: [ai, symfony, php, tutorial, mcp, oauth, security]
draft: false
---

*By Johannes Wachter, Sulu core developer and Symfony AI core team member. Part five of a small tutorial series for the Symfony AI hackathon: the brain stops relying on each tool to remember its own permission check.*

[Part four](/blog/synapse-roles-mcp-symfony-ai?utm_source=blog&utm_campaign=synapse-tool-guards-mcp-symfony-ai) ended on a sentence I did not like writing: the check lives inside the tool, so a seventh tool that writes needs its own call to `denyUnlessWriter()`, and nothing complains if you forget. My smoke test checked those two write tools by name. It had no way to check a tool that did not exist yet.

So this part has two changes, and the second one matters more than the first. A tool is closed to readers unless it says that it is read-only. And the test finds the tools itself, so nobody has to extend a list when a tool is added.

## What you will have at the end

A guard in front of every tool call. It looks at what the tool declares about itself: a tool with `readOnlyHint: true` is open to every token that may enter the endpoint, and any other tool needs the `brain:write` scope. The `denyUnlessWriter()` calls are gone, and so is the `BrainTools` class that carried them: the attributes now sit on the agent tools themselves. And `bin/smoke` calls every tool the server lists with a reader token and checks that each one is either read-only or refused.

## Assumptions

Everything from part four, on the branch `05-tool-guards` of [wachterjohannes/synapse-tutorial](https://github.com/wachterjohannes/synapse-tutorial). No new packages.

## Say it once, on the tool

The MCP specification lets a tool carry annotations, and one of them is `readOnlyHint`: the tool does not change its environment. Its default is false, which is the direction I want. The four tools that only read say so, and they say it on the same class that the agent uses, next to its `#[AsTool]`:

```php
#[McpTool(name: 'read_note', description: 'Reads one note by the path list_notes or search_notes shows.', annotations: new ToolAnnotations(readOnlyHint: true))]
#[AsTool('read_note', 'Reads one note. Pass the path exactly as list_notes shows it, for example "brain/topics/mcp.md".')]
final class ReadNote
```

The two descriptions are different on purpose. The agent is told when to reach for the tool, the remote client is told what the call does. The MCP one has to be given in the attribute: on a class, the SDK does not take it from a docblock, and the tool showed up in `debug:mcp` without a description until I passed `description:`.

`save_to_inbox` and `save_to_brain` say nothing, so they count as tools that change something. The annotation also ends up in `tools/list`, so a client sees the same declaration that the server acts on.

The specification calls annotations hints and tells clients not to trust them unless they come from a server they trust. That is the right rule for a client. In this part I am the server, and I use my own annotation as the input of my own policy. A hint from somebody else's server would not be a security decision I could take from them.

## The wrapper can go

In part three and four the MCP tools lived in `BrainTools`, a thin class that forwarded to the agent tools. I kept it because the permission check sat inside it, and the agent tools run on the console, where there is no token. With the guard in front of the SDK, nothing in the tool classes knows about tokens any more, so the reason for the second class is gone. `#[McpTool]` goes on the agent tools, `BrainTools` is deleted, and the registry in `config/packages/mcp.yaml` points at `App\Ai\` instead of `App\Mcp\`. The tools, their names and their input schemas are the same as before, and `debug:mcp` lists the same six.

## One guard in front of every call

The SDK hands every tool call to a reference handler, which finds the service and calls the method. That is the one place that sees all calls, so the guard wraps it:

```php
public function handle(ElementReference $reference, array $arguments): mixed
{
    if ($reference instanceof ToolReference
        && true !== $reference->tool->annotations?->readOnlyHint
        && !$this->authorizationChecker->isGranted('ROLE_BRAIN_WRITE')
    ) {
        throw new ToolCallException('This token may only read. Writing needs the brain:write scope.');
    }

    return $this->inner->handle($reference, $arguments);
}
```

The `instanceof ToolReference` check is why only tool calls go through the guard. Resources and prompts reach the server unchecked. That is deliberate here, both only read in this app, not an oversight.

The refusal is the same `ToolCallException` as in part four, so the client sees the same `isError: true` and the same text. What changed is who decides. A new tool is closed to readers from the moment it exists, and opening it is a visible decision, a `readOnlyHint: true` in a diff. Forgetting it fails in the safe direction: a reader is locked out of something that is harmless, and somebody notices.

The part I am less happy about is how the guard gets in. The MCP bundle has no setting for the reference handler in 1.0.0-BETA1. It builds the handler itself and gives the service locator to the server builder. A small compiler pass, registered in the kernel after the bundle's own, reads that locator and wraps the handler:

```php
$builder->addMethodCall('setReferenceHandler', [new Definition(ToolGuard::class, [
    new Definition(ReferenceHandler::class, [$locator]),
    new Reference('security.authorization_checker'),
])]);
```

That reaches into a detail of the bundle, and it is the first thing I would check again with the next release. The pass refuses to run if a handler is already set, so it fails loudly and does not wrap twice.

## A test that finds the tools

`tools/guard-check.php` asks the running server for `tools/list` with a reader token. For every tool it fills the required arguments with dummy values from the input schema and calls it. A tool that is not read-only must answer with `isError: true` and the refusal text. A read-only tool must not be refused. Afterwards it compares the notes folder with how it was before, because a reader must not change anything either way.

Nothing in it names a tool, so the next tool is part of the test the moment the server lists it.

## Verify it

The check inside `bin/smoke`, with the six tools of the branch:

```
  ok    describe_format read-only, open to a reader
  ok    list_notes     read-only, open to a reader
  ok    read_note      read-only, open to a reader
  ok    save_to_brain  not read-only, refused for a reader
  ok    save_to_inbox  not read-only, refused for a reader
  ok    search_notes   read-only, open to a reader
  ok    every tool is either read-only or refused for a reader
```

I added a seventh tool, `append_to_log`, that appends a line to the update log. No check, no annotation, and no change to the test:

```
  ok    append_to_log  not read-only, refused for a reader
  ok    describe_format read-only, open to a reader
  ok    list_notes     read-only, open to a reader
  ok    read_note      read-only, open to a reader
  ok    save_to_brain  not read-only, refused for a reader
  ok    save_to_inbox  not read-only, refused for a reader
  ok    search_notes   read-only, open to a reader
  ok    every tool is either read-only or refused for a reader
```

The new tool was refused for the reader without anyone asking for it, and the test listed it. In part four the same tool would have written the line.

For the reverse case I commented out the compiler pass, which is what a bundle update that changes the wiring would do to me.

```
  FAIL  a reader may not write
  FAIL  an admin may write
  FAIL  a reader may not write to the brain either
  FAIL  save_to_brain  not read-only, refused for a reader
  FAIL  save_to_inbox  not read-only, refused for a reader
  FAIL  the notes changed while a reader called the tools
  FAIL  every tool is either read-only or refused for a reader
```

With the pass gone the reader writes, and the test is red in seven places. One of them looks odd at first: `an admin may write` fails too. The reader had already written the same file, so the admin is told that it exists.

## Where this stops

The test trusts the annotation as much as the guard does. A tool that writes and says `readOnlyHint: true` is open to readers. I tried it with `append_to_log` marked read-only. The only thing that turned the test red was the notes comparison, because the tool happens to write into the notes folder when it is called with dummy values. A tool that writes somewhere else, or only for certain arguments, would pass. A review of the diff is still what catches that. What I would work on next is that case, a tool marked read-only that writes somewhere else.

A reader still sees the write tools in `tools/list`. The guard refuses the call and does not hide the tool. That is the friendlier behaviour I left out in part four, and it still depends on the list being filtered by token.

The guard decides between two roles. It does not know that the inbox and the brain are different places, or that one write tool is more dangerous than another. The spec already has a field for that, `destructiveHint`; a finer policy would read it the same way this one reads `readOnlyHint`, but that is a next step, not this one. And if `#[IsGranted]` on MCP tools arrives upstream, part of this will become a configuration instead of a class.
