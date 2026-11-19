---
title: "Ask a second brain over MCP and rank both answers together, with Symfony AI"
description: "Let a Symfony AI app ask a second brain over MCP, merge both result lists with a Cohere reranker, and keep working when the other brain is down, refuses the token or the reranker fails."
pubDate: 2026-11-19
category: "// SYMFONY AI"
readingTime: "9 min"
heroImage: "/images/posts/synapse-mcp-client-rerank-symfony-ai-header.png"
heroAlt: "Header: Synapse, part six. One question, two brains, ranked into one list."
tags: [ai, symfony, php, tutorial, mcp, rag]
draft: false
---

*By Johannes Wachter, Sulu core developer and Symfony AI core team member. Part six of a small tutorial series for the Symfony AI hackathon: the brain becomes a client of another brain.*

Until now the brain was always the one being asked: an MCP server behind an authorization server in [part three](/blog/synapse-mcp-server-oauth-symfony-ai?utm_source=blog&utm_campaign=synapse-mcp-client-rerank-symfony-ai), a role check on the tools that write in [part four](/blog/synapse-roles-mcp-symfony-ai?utm_source=blog&utm_campaign=synapse-mcp-client-rerank-symfony-ai), a guard closing every tool to readers by default in part five. This part turns it around: a question goes to my notes and to somebody else's notes over MCP, and the passages of both come back as one list.

My first version of this class was straight line code: search my own index, call the other brain, parse its answer with a regular expression over a plain text format, hand everything to a reranker. It worked while everything was up, until a review asked what happens when the other brain is down. The answer was an exception, my own notes untouched a line above it. Most of this part exists for that question: a second brain is a service you do not control.

## What you will have at the end

A command, `app:federate "<question>"`, that searches your own index, asks a second brain for its passages with `search_notes` over MCP, and puts both lists through a Cohere reranker. Each line of output says whose passage it is, `mine:` or `friend:`, and which file it came from. If the second brain is down or refuses the token, you still get your own passages and a warning why. If the reranker fails, you get the passages in arrival order and a second warning.

## Assumptions

Everything from part five, on the branch `06-mcp-client` of [wachterjohannes/synapse-tutorial](https://github.com/wachterjohannes/synapse-tutorial). No new packages: the MCP bundle already contains a client, and the reranker is part of the store package you installed in part two.

## The second brain

For this I need a second brain that is not mine. The branch ships `examples/friend-notes`, four notes about MCP authorization, roles, reranking and gardening: the same application with other notes, its own index and its own address. The address of a brain is its audience, as in part three, so the second brain only accepts tokens issued for its own address. Start it next to the authorization server from part three. The two variables point it at its own files, set per command so they do not leak into the commands for your own brain:

```bash
env BRAIN_DIR=$PWD/examples/friend-notes BRAIN_DB=$PWD/var/friend.sqlite \
  php bin/console ai:store:setup brain
env BRAIN_DIR=$PWD/examples/friend-notes BRAIN_DB=$PWD/var/friend.sqlite \
  php bin/console ai:store:index brain
env BRAIN_DIR=$PWD/examples/friend-notes BRAIN_DB=$PWD/var/friend.sqlite \
  OAUTH_AUDIENCE=http://127.0.0.1:8082/mcp \
  php -d variables_order=EGPCS -S 127.0.0.1:8082 -t public public/index.php
```

Each command spells the variables out on its own: putting them into one shell variable and expanding it after `env` works in bash only. In zsh and fish the variable is not split, and what looks like a working second brain then answers from your own notes.

My own brain does not need to run as a server here. The command reads my index directly, so it only needs indexing (`ai:store:index brain`, after `ai:store:clear brain --force` if you indexed before).

## Configuring the client

The MCP bundle has a `clients` section next to `servers`, and a second brain is three lines of YAML:

```yaml
mcp:
    clients:
        brain:
            servers:
                friend:
                    transport: http
                    url: '%env(FRIEND_BRAIN_URL)%'
                    headers:
                        Authorization: 'Bearer %env(FRIEND_BRAIN_TOKEN)%'
```

The token is a static header, which I ask the authorization server for myself, with the second brain's address as the `resource`, the same request as in part three:

```bash
curl -s -X POST http://127.0.0.1:8081/token \
  -d client_id=reader -d client_secret=reader-secret -d resource=http://127.0.0.1:8082/mcp
```

Ask for the reader. This client only ever calls `search_notes`, and a token that cannot write is the one you should be holding when you knock on somebody else's door.

## Why a reranker

The two brains score their passages on their own scales, so the scores cannot be compared. Each score comes from a different index, built from different notes, so a 0.7 in one place says nothing about a 0.7 in the other.

A reranker avoids the problem by ignoring those scores. It reads the question and the text of every candidate and sorts them again. Cohere offers one as a model, and in Symfony AI it is a service with a platform and a model name:

```yaml
Symfony\AI\Store\Reranker\Reranker:
    arguments:
        $platform: '@ai.platform.cohere'
        $model: 'rerank-v3.5'

Symfony\AI\Store\Reranker\RerankerInterface: '@Symfony\AI\Store\Reranker\Reranker'
```

The reranker wants documents, and a `VectorDocument` insists on a vector, but this one only reads the text. So the candidates carry a placeholder vector with one zero in it. It is a little ugly, and it keeps the vector out of every ranking decision, which is the point.

## The class

This is `Federation`, with the error handling left in:

```php
public function search(string $question, string $server = 'friend', int $limit = 5): array
{
    $this->warning = null;
    $candidates = [];
    foreach ($this->retriever->retrieve($question, ['maxItems' => 5]) as $document) {
        $metadata = $document->getMetadata();
        $candidates[] = $this->candidate('mine:'.($metadata->getSource() ?? 'unknown'), $metadata->getText() ?? '');
    }

    try {
        $result = $this->client->get($server)->callTool('search_notes', ['query' => $question]);
        foreach ($result->content as $content) {
            foreach (json_decode($content->text ?? '[]', true, 8, \JSON_THROW_ON_ERROR) as $passage) {
                if (\is_array($passage) && \is_string($passage['source'] ?? null) && \is_string($passage['text'] ?? null)) {
                    $candidates[] = $this->candidate($server.':'.$passage['source'], $passage['text']);
                }
            }
        }
    } catch (\Throwable $e) {
        $this->warning = sprintf('Could not ask "%s", showing only the passages of this brain: %s', $server, $e->getMessage());
    }

    try {
        return $this->reranker->rerank($question, $candidates, $limit);
    } catch (\Throwable $e) {
        $this->warning = trim(($this->warning ?? '').sprintf(' Could not rerank, showing the passages in the order they came: %s', $e->getMessage()));

        return \array_slice($candidates, 0, $limit);
    }
}
```

Three decisions are in there. The two separate `try` blocks: the other brain and the reranker fail for different reasons, and a failure of one must not hide the other or lose the passages already in hand. The parsing: `search_notes` answers with a JSON list of `source` and `text`, and the code checks the shape of every entry, because the answer comes from a server that is not mine. The old version split a plain text format with a regular expression, and a note containing the separator would be read as another passage. JSON does not have that problem. And the prefix: every candidate is labelled with the brain it came from, so the reader always knows whose passage they are looking at.

## What leaves your machine

Two things worth knowing. The question goes to the second brain's server, which sees it in plain words. And the question together with both brains' passages goes to Cohere for the reranking, so the other brain's notes pass through your Cohere account too. With a friend and a trial key that is fine. With someone else's notes, ask first.

The text coming back is not yours either. The command escapes it before printing, so a note cannot inject console markup. Nothing in this step feeds that text to a model that could be talked into something, and that is on purpose: the moment an agent reads the other brain's passages, prompt injection through a note becomes a real question. This part does not answer it.

## Verify it

My own index and the second brain's, the reader token for the second brain, and one question that both brains have notes about:

```
$ FRIEND_BRAIN_URL=http://127.0.0.1:8082/mcp FRIEND_BRAIN_TOKEN=<that token> \
    php bin/console app:federate "How do I protect an MCP server?"
#1 [0.770] mine:brain/decisions/mcp-auth-external.md
   --- type: Decision title: "Protect the MCP server with an external OAuth server" description: "Why the brain's MCP server should not run ...
#2 [0.548] friend:brain/topics/mcp-authorization.md
   --- type: Topic title: "MCP authorization in practice" description: "How an MCP server decides who may call its tools." tags: [mcp, oauth...
#3 [0.453] friend:brain/topics/mcp-roles.md
   --- type: Topic title: "Roles for MCP tools" description: "Mapping OAuth scopes to what a tool may do." tags: [mcp, security, scopes] sta...
#4 [0.014] mine:brain/topics/php-security-lessons.md
   --- type: Topic title: "PHP security release, October 2026" description: "What the PHP Foundation said about the delayed fix." tags: [php...
#5 [0.009] mine:brain/topics/cohere-trial-key.md
   --- type: Topic title: "Cohere trial key limits" description: "The trial key is rate limited and not meant for indexing large corpora." t...
```

The best passage is mine, the next two are the second brain's, and they are interleaved in one ranking. The scores printed here are the reranker's, so they are comparable across the passages in front of you.

Next, a token for my own brain's address, shown to the second one.

```
 [WARNING] Could not ask "friend", showing only the passages of this brain:
           Failed to connect MCP client "brain" to server "friend":
           Initialization failed: Server answered with HTTP 401 Unauthorized.

#1 [0.770] mine:brain/decisions/mcp-auth-external.md
...
```

A token for one brain does not open the other, because the audience differs. The command did not crash, and my own passages still came back. A missing token gives the same message, so a `401` here only tells you to check the token.

With the second brain stopped:

```
 [WARNING] Could not ask "friend", showing only the passages of this brain:
           Failed to connect MCP client "brain" to server "friend": HTTP request
           failed: Failed to connect to 127.0.0.1 port 8082 after 0 ms: Could
           not connect to server for "http://127.0.0.1:8082/mcp".

#1 [0.770] mine:brain/decisions/mcp-auth-external.md
...
```

The MCP client logs every failed request at error level, and without Monolog the default logger prints that to stderr: eight lines of `[error] Transport error` for one unreachable server. The branch replaces the `logger` service with the framework's own `Logger` set to `critical` in `config/services.yaml`, since the command already reports the failure and the warning is what matters. It is a blunt tool: it silences everything below critical for this small application. And when the reranker fails, here with a model name that does not exist:

```
 [WARNING] Could not ask "friend", ... Could not rerank, showing the passages
           in the order they came: No provider found for model "rerank-nope".

#1 [-] mine:brain/decisions/mcp-auth-external.md
```

The scores print as `-` in that case, because without a reranker there are no scores. The passages are in the order they arrived, mine first.

The branch's `bin/smoke` with a Cohere key checks the first and the second case and the rest of the series along the way. In my run all 28 checks were green. Without a key it still checks that the command is registered.

## Where this stops

The token is fetched by hand and sits in a header. A real authorization server expires its tokens, and nothing here refreshes this one. Whether the bundle's client can run the authorization flow by itself, I did not verify.

The parsing only works against a second brain that answers `search_notes` in this JSON shape. Another MCP server with a tool of the same name and a different answer would give you an empty list and no warning, which is what you get from a client written against one tool.

And nothing here answers a question. Letting an agent read them and write an answer that names both brains is the obvious next step, and it comes with the problem named above: the text of a brain I do not own would then reach a model.

This is the last tutorial part of the series. The other parts are on the [series page](/synapse), each one a branch of the same repository.
