---
title: "Building a minimal RAG pipeline with Symfony AI"
description: "A minimal RAG pipeline in PHP with Symfony AI: index the Symfony docs, embed, retrieve by vector similarity, and answer. The deliberate hello world we then improve."
pubDate: 2026-10-28
category: "// RAG"
readingTime: "8 min"
heroImage: "/images/posts/minimal-rag-pipeline-symfony-ai-header.png"
heroAlt: "Header: RAG, tutorial one. Minimal RAG: index, embed, retrieve, answer with Symfony AI."
tags: [ai, rag, symfony, php, tutorial]
draft: false
---

*By Johannes Wachter, Sulu core developer and Symfony AI core team member. The first hands-on part of the series: the smallest honest RAG pipeline, the one most tutorials stop at, so the later parts have a real problem to fix.*

## What you will have at the end

By the end you can ask a plain question against the Symfony documentation and get an answer assembled from it, visibly wrong in an instructive way, which is why the rest of the series exists.

In the [high-level piece](/blog/rag-beyond-hello-world) I argued that retrieval is a pipeline, not a lookup, and that the naive version breaks on real documentation. Here I build that naive version on purpose: embed the question, fetch the nearest documents by vector similarity, and hand them straight to a model, with no query rewriting, keyword matching or reranking.

Everything runs on one provider: Cohere supplies the chat model, the embeddings, and later in the series the reranker, so the whole thing needs a single API key and no local model server.

## Assumptions

I am on PHP 8.2 or newer, with Symfony AI at `^1.0@beta`, and a Cohere API key. A free trial key is enough to try the pipeline, but it is limited to 100,000 tokens per minute, so indexing the full corpus can hit that limit. A production key avoids it. The runnable script clones the Symfony documentation, so the setup also needs network access, a few minutes, and some disk space.

## Setup

Start a bare PHP project and install the Symfony AI pieces:

```bash
composer init --no-interaction --name=rag-tutorial/minimal-rag
composer require symfony/ai-platform:^1.0@beta symfony/ai-cohere-platform:^1.0@beta \
    symfony/ai-store:^1.0@beta symfony/ai-sqlite-store:^1.0@beta \
    symfony/event-dispatcher symfony/http-client symfony/dotenv
```

The key goes into `.env.local`, which stays out of version control:

```bash
echo 'COHERE_API_KEY=...' > .env.local
```

A shared `bootstrap.php` wires the provider and store once; SQLite is the whole infrastructure for now:

```php
use Symfony\AI\Platform\Bridge\Cohere\Factory as CohereFactory;
use Symfony\AI\Store\Bridge\Sqlite\Store;
use Symfony\Component\Dotenv\Dotenv;
use Symfony\Component\HttpClient\HttpClient;

const LLM_MODEL = 'command-a-03-2025';
const EMBEDDING_MODEL = 'embed-english-v3.0';

// Loads .env, then .env.local on top of it. An exported variable still wins.
(new Dotenv())->loadEnv(__DIR__ . '/.env');

$platform = CohereFactory::createPlatform($_SERVER['COHERE_API_KEY'], HttpClient::create(['timeout' => 120]));

$pdo = new PDO('sqlite:' . __DIR__ . '/symfony_docs.sqlite');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$store = Store::fromPdo($pdo, 'symfony_docs');
$store->setup();

return [$platform, $store];
```

In the repository this file also stops with a readable error when the key is missing: an empty key otherwise only fails several hundred embedding calls into indexing, an expensive way to learn you forgot something.

Most of the pipeline does not need to know which provider is behind the platform. Provider-specific model options can still leak through, as Cohere's query embedding mode will in a moment.

## Indexing the documentation

RAG can only retrieve what you have already indexed, so the first step is filling the store. The corpus is the real Symfony documentation, and I index four versions on purpose, 4.4, 5.4, 7.4 and 8.0, so similar pages from different versions compete with each other, which is what makes the retrieval problem realistic.

The indexer turns the docs into documents, embeds them with Cohere, and writes them to the store. Two small steps are worth calling out. I am keeping the basic indexing fixes from the earlier piece: the naive baseline I want to isolate in this part is query-time retrieval, not an index I already know contains junk.

The first is a transformer that prepends the version to each document's text before embedding, so a search has at least some signal to tell versions apart. The second is a filter, added after watching the results: the RST loader recognises a heading purely by its shape, a line followed by a row of punctuation, and inside a code block that shape occurs by accident, so a stray brace or Twig line becomes the heading of its own fragment. Those fragments were reaching the top five results. Filtering runs before vectorisation, so it saves the embedding calls too.

```php
use Symfony\AI\Store\Document\FilterInterface;
use Symfony\AI\Store\Document\TransformerInterface;
use Symfony\AI\Store\Document\Vectorizer;
use Symfony\AI\Store\Indexer\DocumentProcessor;
use Symfony\AI\Store\Indexer\SourceIndexer;
use Symfony\AI\Store\Document\Loader\RstToctreeLoader;

$junkFilter = new class implements FilterInterface {
    public function filter(iterable $documents, array $options = []): iterable
    {
        foreach ($documents as $document) {
            $title = trim($document->getMetadata()->getTitle() ?? '');

            // Needs a real word in the title and enough prose to be worth embedding.
            if (!preg_match('/\p{L}{3}/u', $title) || mb_strlen(trim($document->getContent())) < 80) {
                continue;
            }

            yield $document;
        }
    }
};

$versionTagger = new class implements TransformerInterface {
    public string $version = '';
    public function transform(iterable $documents, array $options = []): iterable
    {
        foreach ($documents as $document) {
            yield $document->withContent("Symfony {$this->version} documentation.\n\n" . $document->getContent());
        }
    }
};

$vectorizer = new Vectorizer($platform, EMBEDDING_MODEL);
$processor = new DocumentProcessor($vectorizer, $store, filters: [$junkFilter], transformers: [$versionTagger]);
$indexer = new SourceIndexer(new RstToctreeLoader(), $processor);

foreach (['4.4', '5.4', '7.4', '8.0'] as $version) {
    $versionTagger->version = $version;
    // Expects a shallow clone of the docs branch at this path (see below).
    $indexer->index("path/to/symfony-docs-{$version}/index.rst");
}
```

The indexer does not fetch anything: the snippet expects one shallow clone of the documentation per version, for example `git clone --depth 1 --branch 8.0 https://github.com/symfony/symfony-docs.git path/to/symfony-docs-8.0`. The runnable `index.php` in the repository runs that clone itself for each version that is missing before it indexes, which I leave out here to keep the pipeline visible.

The filter in the repository is slightly stricter; it also drops headings that are really template lines, such as `Welcome {{ email.toName }}!`. Both are guesses about what is worth embedding, and that is the honest description of them. Which parts of documentation help retrieval is the question the [indexing piece](/blog/indexing-for-rag) leaves open.

The `Vectorizer` is the first place the provider abstraction earns its keep: it takes a platform and an embedding model name, indifferent to Cohere being behind it. Running this once embeds a few thousand documents, which takes a few minutes; the runnable script in the repository clones the docs first if needed.

Confirm the store filled up before moving on; everything downstream is meaningless against an empty index:

```bash
sqlite3 symfony_docs.sqlite 'select count(*) from symfony_docs'
```

The count should be in the thousands, not zero; zero means the clone or the embedding step failed quietly, and every query downstream would return emptiness.

## Retrieving and answering

Now the naive query: embed the question, ask the store for the five nearest documents, and let the model write an answer from them. Pure vector search is the baseline I want to feel before improving anything, and getting genuinely pure vector search took two corrections I did not expect.

```php
use Symfony\AI\Platform\Message\Message;
use Symfony\AI\Platform\Message\MessageBag;
use Symfony\AI\Store\Document\Vectorizer;
use Symfony\AI\Store\Retriever;
use Symfony\Component\EventDispatcher\EventDispatcher;

[$platform, $store] = require __DIR__ . '/bootstrap.php';
require __DIR__ . '/helpers.php';

$query = $argv[1] ?? 'send email';

$vectorizer = new Vectorizer($platform, EMBEDDING_MODEL);
$retriever = new Retriever(vectorOnly($store), forQueries($vectorizer), new EventDispatcher());

$results = iterator_to_array($retriever->retrieve($query, [
    'maxItems' => 5,
]));

$context = '';
foreach ($results as $document) {
    $metadata = $document->getMetadata();
    printf("%.4f  %s  (%s)\n", $document->getScore(), $metadata->getTitle(), $metadata->getSource());
    $context .= sprintf("Source: %s\nTitle: %s\n%s\n\n---\n\n", $metadata->getSource(), $metadata->getTitle(), $metadata->getText());
}

$messages = new MessageBag(
    Message::forSystem('You are a helpful assistant. Answer the question based ONLY on the provided context. If the context contains conflicting information from different versions, mention all of them.'),
    Message::ofUser("Context:\n{$context}\n\nQuestion: {$query}"),
);

echo $platform->invoke(LLM_MODEL, $messages)->asText();
```

The printed line for each result is not an afterthought. The RST loader keeps the original text as metadata, and the version tag added during indexing lives only in the embedded content, not in that metadata text, so without source and title in the context the model has no reliable way to tell which passage came from which version. That is what makes the hedging below a property of retrieval, not a gap in what the model was shown.

The two wrappers are the corrections, both a few lines in `helpers.php` in the [companion repository](https://github.com/wachterjohannes/rag-beyond-hello-world). My first version passed `semanticRatio: 1.0`, assuming that meant pure vector search. The SQLite store builds a hybrid query regardless, and a ratio of `1.0` only weights the keyword half to zero: the ranking comes out the same, but the scores on screen become Reciprocal Rank Fusion scores, near `1/(60+rank)` and almost identical by construction. I noticed only because the numbers looked suspiciously alike, nothing had actually failed. `vectorOnly()` hides the store's hybrid support, so this step reports real cosine distances I can actually read.

The second correction: Cohere embeds a stored document and a search query in different modes, so a short question lands near the longer passage answering it. The default is document mode, right for the indexer and wrong here, and the retriever passes no options to the vectorizer, so `forQueries()` pins the query mode itself. Both wrappers exist for the same reason: the naive version was quietly doing something other than what it claimed.

The shape is worth noticing: it is the whole of RAG in three moves. `Retriever` finds the candidates, `MessageBag` augments the prompt with them, and `$platform->invoke` generates the answer. Every later part of the series changes one of those three moves without disturbing the other two.

## Run it, and see where it breaks

```bash
php query.php "send email"
```

At a glance the answer looks reasonable; look closer and the cracks show. The printed lines above it are the real verification: real cosine distances, not the near-identical RRF scores from before, and they show the retrieved documents are a mix of Symfony versions sitting at very similar distances. Told to mention conflicting versions, the model dutifully hedges across all of them. Ask for something with an exact name like "Mailer" and the literal section can sit below softer semantic matches.

A nonsense query is a weaker, secondary check: ask something the docs do not cover and watch the context turn irrelevant. It is not conclusive, a model can still answer from its own training or ignore the grounding instruction, but a confident answer to a question the docs cannot cover is still worth noticing.

Nothing here is broken. This is pure vector search doing exactly what it does: finding documents close in meaning. The trouble is the one from the first article: close in meaning is not the same as right, and this pipeline has no way to tell the two apart.

## What is missing, and what is next

Reading back over what we built, the gaps have precise names, which is the useful part. Nothing checked whether we were searching for the right thing, so "send email" went to the index unimproved. Candidates were generated only one way, letting exact terms lose to fuzzy neighbours. And the retrieval order was trusted as if it were already a ranking, which it never was.

Those gaps are what the rest of the series works through, one at a time, on this same example.

The full, runnable code for every step lives in the [companion repository](https://github.com/wachterjohannes/rag-beyond-hello-world).
