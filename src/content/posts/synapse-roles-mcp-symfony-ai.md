---
title: "Let readers read and admins write on an MCP server, with Symfony"
description: "Give an MCP server two roles in Symfony: scopes from the authorization server become roles, and the write tools refuse a read-only token with a message the client can show."
pubDate: 2026-11-11
category: "// SYMFONY AI"
readingTime: "6 min"
heroImage: "/images/posts/synapse-roles-mcp-symfony-ai-header.png"
heroAlt: "Header: Synapse, part four. Check the role again, inside every tool."
tags: [ai, symfony, php, tutorial, mcp, oauth, security]
draft: false
---

*By Johannes Wachter, Sulu core developer and Symfony AI core team member. Part four of a small tutorial series for the Symfony AI hackathon: the brain learns that a token that may look at the notes is not necessarily one that may change them.*

At the end of [part three](/blog/synapse-mcp-server-oauth-symfony-ai?utm_source=blog&utm_campaign=synapse-roles-mcp-symfony-ai) I asked for a token with the scope `brain:read`, called `save_to_inbox`, and got `Saved inbox/2026-11-02-from-reader.md` back. The brain had looked at the scope, turned it into a role, and used `ROLE_BRAIN_READ` to decide whether the request may enter the MCP endpoint. What it did not do was ask again when a particular tool was called. Once inside, a reader could call `save_to_inbox` just like `read_note`.

The fix is about twenty lines. What took me longer was deciding where those lines belong, so this part is short on code and spends its words on that question. It is the smallest step of the series, and I think it is the one people skip most often.

## What you will have at the end

Two kinds of callers on the same `/mcp` endpoint. A token with `brain:read` can search, list, read and ask for the note format. A token with `brain:write` can do that and also save to the inbox and to the brain. A reader that is allowed onto the endpoint but tries to call a write tool gets a tool result that says what is missing, which a client can show to its model, and nothing is written.

## Assumptions

Everything from part three, on the branch `04-roles` of [wachterjohannes/synapse-tutorial](https://github.com/wachterjohannes/synapse-tutorial). No new packages.

## Roles come from scopes, and only from scopes

Part three already did the first half. The token handler maps exactly two scope strings to roles, `brain:read` to `ROLE_BRAIN_READ` and `brain:write` to `ROLE_BRAIN_WRITE`. Scopes are case-sensitive, so `brain:Write` is not the same scope and gets no role. The scopes come from the authorization server's answer about the token, so a client cannot hand itself a role. If it wants more scopes, it has to ask the authorization server, which decides.

The second half is three lines of configuration:

```yaml
security:
    role_hierarchy:
        ROLE_BRAIN_WRITE: [ROLE_BRAIN_READ]
```

Whoever may write may also read, so an admin token only needs to carry the write scope for the firewall's `ROLE_BRAIN_READ` rule to let it through. In the fake authorization server the `admin` client gets both scopes. A real authorization server decides which of the requested scopes to grant according to its own policy, and may grant only some of them. The role hierarchy is local to this application: the authorization server does not know that `ROLE_BRAIN_WRITE` implies `ROLE_BRAIN_READ` here.

## Where the check belongs

My first thought was `access_control`. It matches on the path, and that does not help here: every call to every tool is a `POST` to `/mcp`, and the name of the tool is inside the JSON-RPC body. From the outside, reading a note and saving one look the same.

The second thought was the Symfony way, an `#[IsGranted('ROLE_BRAIN_WRITE')]` attribute on the tool method. I tried it on `save_to_inbox`, removed the explicit check, restarted the server and called the tool with the reader token. The note was written. The attribute neither failed nor warned. That makes sense once you look at the execution path. `#[IsGranted]` is documented for controller actions, where a listener reads the attribute before the action runs. An MCP tool is an ordinary service method that the MCP SDK calls directly, so nothing in between reads the attribute. There is an open pull request in symfony/ai, [#2830](https://github.com/symfony/ai/pull/2830), that adds support for `#[IsGranted]` on MCP tools by moving the check into Symfony's controller security layer before the MCP server runs, which gives an OAuth-aware client a proper security challenge instead of a tool result. I wrote this against 1.0.0-BETA1, where the attribute has no effect at all. A security check that can be silently absent needs a test that proves the boundary, otherwise nobody notices when it is gone. So the branch checks explicitly, inside the tool class:

```php
private function denyUnlessWriter(): void
{
    if (!$this->authorizationChecker->isGranted('ROLE_BRAIN_WRITE')) {
        throw new ToolCallException('This token may only read. Writing needs the brain:write scope.');
    }
}
```

and the two tools that write call it first:

```php
#[McpTool(name: 'save_to_inbox')]
public function saveToInbox(string $slug, string $text): string
{
    $this->denyUnlessWriter();

    return ($this->saveToInbox)($slug, $text);
}
```

`save_to_brain` does the same. The `AuthorizationCheckerInterface` is injected like any other service, and because the firewall is stateless it sees the roles of the token of this request. This is also the reason `BrainTools` exists as its own class. It only ever runs behind the firewall. The tools of the agents run on the console, where there is no token, and a check for `ROLE_BRAIN_WRITE` inside them would refuse every write of the capture agent.

## An error the client can read

The refusal is a `ToolCallException`, not an HTTP `403`. The difference matters for the client. A `403` on the transport says that the request as a whole is forbidden, and what a client does with that depends on the client. A tool result with `isError: true` says that this tool call failed and why, and the model can carry on with the tools it may use, or tell the person that it needs a different token. It is the same idea as in part one, where errors go back to the model as text instead of stopping the run, now applied to a single tool call.

## Verify it

The reader token and the admin token, each asking to write to the inbox with the slug `from-reader`. These are the text fields of the tool results, decoded. The raw JSON escapes slashes as `\/`:

```
reader, isError true:
This token may only read. Writing needs the brain:write scope.

admin, isError false:
Saved inbox/2026-11-02-from-reader.md
```

The inbox holds one file afterwards, the admin's. The reader can still read: `read_note` with the reader token returns the note, and `save_to_brain` is refused with the same message. The branch's `bin/smoke` checks both refusals and the admin's write. None of it needs a Cohere key.

## Where this stops

Three things I left as they are, and one I would change.

A reader still sees the write tools. A `tools/list` call with the reader token returns all six, including `save_to_inbox` and `save_to_brain`, and a client will offer them to its model, which then learns by failing. Listing only what a token may use would be friendlier, and it means the list depends on the token. I did not build that, because the refusal is the part that protects anything.

Two roles are coarse. "May write" covers the inbox and the brain alike, there is no role for one folder and no way to let someone add raw material without being able to write finished notes. Whether that is acceptable depends on who holds the admin token.

The write tools report their own failures, "already exists" for one, as ordinary text in a successful result, the way part one set them up so that the model can read the problem and try again. A client that wants to tell the two apart has to read the text, because `isError` stays false.

The check is something you have to remember. It lives in the tool class, so a seventh tool that writes needs its own call to `denyUnlessWriter()`, and nothing complains if you forget. The smoke test refuses the reader on both writing tools that exist today. What I would want is a test that walks every tool that changes anything, so a seventh one cannot slip through, and I have not written it. The next part is about that.
