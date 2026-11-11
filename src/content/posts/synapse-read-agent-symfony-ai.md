---
title: "Ask your notes a question, built with Symfony AI"
description: "Ask questions about a folder of markdown notes with Symfony AI: embeddings, a SQLite store and a retriever configured in YAML, one search tool, and an agent that names its source file."
pubDate: 2026-11-04
category: "// SYMFONY AI"
readingTime: "9 min"
heroImage: "/images/posts/synapse-read-agent-symfony-ai-header.png"
heroAlt: "Header: Synapse, part two. Ask your notes a question and get the file it came from."
tags: [ai, symfony, php, tutorial, rag]
draft: false
---

*By Johannes Wachter, Sulu core developer and Symfony AI core team member. Part two of a small tutorial series for the Symfony AI hackathon: an agent that answers from your notes and tells you which file it used.*

In the [first part](/blog/synapse-capture-agent-symfony-ai/?utm_source=blog&utm_campaign=synapse-read-agent-symfony-ai) an agent learned to file notes. The brain was write-only after that: I could put things in, and the only way to get them out was to open the folder. This part adds the other direction. You ask a question in plain words, and you get an answer plus the file it came from.

I am deliberately keeping this one brief. Retrieval has a lot of depth, chunking, embeddings and reranking among them, and I have a whole [RAG series](/rag/) on that. Here the interesting part is the opposite: how little code you need when Symfony AI's store and AI bundle do the work.

## What you will have at the end

A command, `app:ask`, that takes a question and answers only from the notes in `notes/brain/`, followed by a `Source:` line with the path of the note it used. A question the notes cannot answer gets a plain "I couldn't find that" instead of a confident guess from the model's own knowledge. The only PHP you write is one loader class, a small vectorizer decorator (a workaround for a missing feature in the beta, [symfony/ai#2871](https://github.com/symfony/ai/pull/2871)), one tool and one command. The rest is configuration.

## Assumptions

Everything from part one, on the branch `02-read-agent` of [wachterjohannes/synapse-tutorial](https://github.com/wachterjohannes/synapse-tutorial). Two more packages, and the same Cohere key as before, because Cohere also offers the embedding model:

```bash
composer require symfony/ai-store:^1.0@beta symfony/ai-sqlite-store:^1.0@beta
```

## Something to search

A search needs a corpus, and a demo corpus should not be documentation. Documentation is long, it is public, and the model has often seen it already, so you cannot tell whether an answer came from your files or from its training. The branch ships six short notes instead: a hackathon, a PHP security release, what changed in 1.0.0-BETA1, a decision to protect the MCP server with an external OAuth server, the limits of a Cohere trial key, and a note on how RAG works. They are small and specific, so for each question I know what the right answer is and which file it lives in.

They are in the same Open Knowledge Format as the notes the capture agent writes, which is the point of this series: what one agent files is what the other one reads.

## The store is configuration

There is no indexing code in this part. The AI bundle builds the vectorizer, the store, the indexer and the retriever from configuration:

```yaml
ai:
    vectorizer:
        cohere:
            platform: 'ai.platform.cohere'
            model: 'embed-english-v3.0'

    store:
        sqlite:
            brain:
                dsn: 'sqlite:%kernel.project_dir%/var/brain.sqlite'

    indexer:
        brain:
            loader: 'App\Brain\NoteLoader'
            source: '%kernel.project_dir%/notes/brain'
            transformers:
                - 'Symfony\AI\Store\Document\Transformer\TextSplitTransformer'
            vectorizer: 'ai.vectorizer.cohere'
            store: 'ai.store.sqlite.brain'

    retriever:
        brain:
            vectorizer: 'App\Brain\QueryVectorizer'
            store: 'ai.store.sqlite.brain'
```

One detail is worth knowing: the vector store is a SQLite file under `var/`, which keeps the whole demo free of services to run: no server, no container, a file you can delete.

> The indexer and the retriever point at different vectorizer ids on purpose. Cohere embeds a stored document and a search query in different modes, and in 1.0.0-BETA1 the Cohere bridge defaults to document mode with no option to ask for the other one from configuration. [symfony/ai#2871](https://github.com/symfony/ai/pull/2871) fixes this configuration path by accepting `input_type` as a string, so once it ships, hopefully before beta2, the query vectorizer can be configured directly and this decorator goes away. Until then, if you call the plain `ai.vectorizer.cohere` from the retriever, nothing crashes and the demo questions below still answer. It is just not the retrieval the rest of this article assumes.

So the retriever goes through a small decorator instead:

```php
final class QueryVectorizer implements VectorizerInterface
{
    public function __construct(
        private readonly VectorizerInterface $inner,
    ) {
    }

    public function vectorize(string|\Stringable|DocumentInterface|array $values, array $options = []): Vector|VectorDocumentInterface|array
    {
        return $this->inner->vectorize($values, ['input_type' => InputType::SearchQuery] + $options);
    }
}
```

registered as a service that wraps the same vectorizer the indexer uses:

```yaml
services:
    App\Brain\QueryVectorizer:
        arguments:
            $inner: '@ai.vectorizer.cohere'
```

The indexer keeps the plain vectorizer, the retriever gets this one, and both still embed with the same model.

Then two console commands that already exist create the table and fill it:

```bash
php bin/console ai:store:setup brain
php bin/console ai:store:index brain
```

## The one class the indexer needs

The indexer needs a loader that turns files into documents. Symfony AI ships a directory loader and a markdown loader, so most of the work is done, and my `NoteLoader` wraps them for two reasons. The first is that `index.md` and `log.md` are reserved files in the format. They list notes instead of holding knowledge, and an index that sits in the store would show up as the best match for half of all questions. The loader skips them, and it skips symlinks and anything that resolves to a place outside the notes folder, because the `Vault` from part one refuses those and an index that follows a link would give back what the vault would not:

```php
foreach ((new DirectoryLoader(['md' => new MarkdownLoader()]))->load($source, $options) as $document) {
    $path = $document->getMetadata()[Metadata::KEY_SOURCE] ?? '';
    if (\in_array(basename($path), self::RESERVED, true)) { // self::RESERVED = ['index.md', 'log.md']
        continue;
    }
    // ...
    yield $document;
}
```

The second reason is a gotcha from building this. The store remembers where a passage came from as the absolute path on disk, but the other tools talk in the paths the vault uses, such as `brain/topics/rag-basics.md`. A search result that names `/home/me/synapse/notes/brain/topics/rag-basics.md` cannot be handed to `read_note`. So the loader rewrites the source to the path relative to the notes folder before the document goes into the store. If you take one thing from this section: the name a retriever returns has to be a name your other tools understand.

## One tool over the retriever

Search is a tool like any other, a class with `#[AsTool]`:

```php
#[AsTool('search_notes', 'Searches the brain and returns the best matching passages as a JSON list of source and text.')]
final class SearchNotes
{
    public function __construct(
        #[Target('brain')]
        private readonly RetrieverInterface $retriever,
    ) {
    }

    public function __invoke(string $query): string
    {
        $passages = [];
        foreach ($this->retriever->retrieve($query, ['maxItems' => 4]) as $document) {
            $metadata = $document->getMetadata();
            $passages[] = ['source' => $metadata->getSource() ?? 'unknown', 'text' => $metadata->getText() ?? ''];
        }

        return json_encode($passages, \JSON_UNESCAPED_UNICODE | \JSON_UNESCAPED_SLASHES | \JSON_THROW_ON_ERROR);
    }
}
```

`#[Target('brain')]` picks the retriever by the name from the configuration. The result is JSON on purpose. A plain concatenation of passages would let the text of one note pose as the start of another passage, or as a different source. With JSON, every passage is a value in a list, and the model can tell where one ends. That makes the structure unambiguous, not the content trusted. A note can still contain instructions the model should not follow, and that is a real prompt injection risk, not a hypothetical one. It stays low here because the notes are mine, nothing in this demo talks to an external interface, and every write goes through tools whose changes git history can undo. None of that holds once the notes come from someone else or the agent gets tools with real consequences.

## The reader agent

The reader is another entry in the agent configuration, with two tools: `search_notes` for retrieving relevant passages from the indexed notes and the `read_note` from part one for opening a whole note when a passage looks promising but cuts off.

```yaml
reader:
    platform: 'ai.platform.cohere'
    model: 'command-a-03-2025'
    max_tool_calls: 6
    prompt:
        file: '%kernel.project_dir%/config/ai/reader.md'
    tools:
        - 'App\Ai\SearchNotes'
        - 'App\Ai\ReadNote'
```

Most of what makes it a reader and not a chatbot is the prompt, which has four rules:

- search first, and again with other words if the first result does not answer
- open a note when a passage is not enough
- answer only from what the notes say, and say so plainly if they do not contain the answer, without filling gaps from its own knowledge
- end with the files used, one per line, as `Source: <path>`

The `AskCommand` is the same shape as the capture command from part one, with the agent `reader` injected and the question as its argument.

## Verify it

I ran this against the real model, starting from an empty store. First a question whose answer sits in one note:

```
$ php bin/console app:ask "What is the backwards compatibility promise of Symfony AI 1.0.0-BETA1?"
# output:
The backwards compatibility promise of Symfony AI starts with the 1.0.0 final release, not with the 1.0.0-BETA1 version.

Source: brain/topics/symfony-ai-1-0-beta1.md
```

Then one where the words in the question are not the words in the note:

```
$ php bin/console app:ask "What happens if I index a large documentation set with the trial key?"
# output:
Indexing a large documentation set with a trial key will hit the limit and throw a RateLimitExceededException.

Source: brain/topics/cohere-trial-key.md
```

The note says "large documentation set" and "trial key", so that one is not a hard case, but it shows that the answer is taken from the note and not from a general idea of rate limits. The third case is the one that matters more, a question the notes cannot answer:

```
$ php bin/console app:ask "What is the capital of Australia?"
# output:
I'm sorry, I couldn't find any information about the capital of Australia in my notes.

Source: N/A
```

The model knows the answer and does not give it. That is the prompt's job, and I would not call it a guarantee, but it held in the runs I did. The `Source: N/A` line is the model following the "end with sources" rule literally, which I left in because it makes an answer without a source easy to spot. The source line is part of the agent's answer too. This tutorial makes the source available to the model but does not independently verify the citation.

## Close the loop with part one

The last check connects both halves. I asked about something that does not exist yet, which gets the expected non-answer:

```
$ php bin/console app:ask "Which Cohere models does the demo use?"
# output:
I'm sorry, I couldn't find any information about which Cohere models the demo uses.

Source: N/A
```

Then I captured a decision with the agent from [part one](/blog/synapse-capture-agent-symfony-ai/?utm_source=blog&utm_campaign=synapse-read-agent-symfony-ai), rebuilt the index and asked again:

```
$ php bin/console app:capture "Decision: the demo uses Cohere command-a-03-2025 for the agents, embed-english-v3.0 for embeddings and rerank-v3.5 for reranking, because one API key covers all three."
# output:
I saved the decision to brain/decisions/demo-models.md.

$ php bin/console ai:store:drop brain --force
$ php bin/console ai:store:setup brain
$ php bin/console ai:store:index brain

$ php bin/console app:ask "Which Cohere models does the demo use?"
# output:
The demo uses the following Cohere models:
- command-a-03-2025 for the agents
- embed-english-v3.0 for embeddings
- rerank-v3.5 for reranking

Source: brain/decisions/demo-models.md
```

One agent filed the note, the other one found it. The branch's `bin/smoke` runs these checks, and with a key it asks the questions for real.

## Where this stops

Look at the three commands between capture and the second question. The index is not updated when a note is written. I rebuild it by hand, and for a demo that is fine. Running `ai:store:index brain` again without clearing first stores every passage a second time, so a rebuild needs either `ai:store:clear brain --force` before indexing again, or the drop-and-setup sequence I used above. A brain that you actually use needs the index to follow the files, through a command on a schedule or an event after each write. I left that out because it is its own problem, with its own trade-offs between cost, freshness and what a failed embedding call should do, the kind of decision the [indexing piece](/blog/indexing-for-rag/?utm_source=blog&utm_campaign=synapse-read-agent-symfony-ai) of the RAG series covers. The same goes for search quality: the retriever returns the nearest passages, and whether those are the right ones is the question the [query-time piece](/blog/rag-beyond-hello-world/?utm_source=blog&utm_campaign=synapse-read-agent-symfony-ai) of that series spends its time on.

What the brain cannot do yet is leave this machine. Both agents live in one console application, and the next thing it needs is a way for something else to talk to it.
