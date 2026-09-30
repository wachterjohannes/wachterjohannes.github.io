---
title: "Indexing sets the ceiling for retrieval"
description: "RAG quality starts at indexing, not at the query. Loading, chunking and enriching the source decide what your retriever can ever find. A field report from symfony/ai."
pubDate: 2026-09-30
category: "// RAG"
readingTime: "7 min"
heroImage: "/images/posts/indexing-for-rag-header.png"
heroAlt: "Header: RAG, part two. Indexing sets the ceiling. Index time: before the first query."
tags: [ai, rag, symfony, php]
draft: false
---

*By Johannes Wachter, Sulu core developer and Symfony AI core team member. The second piece in a series about building retrieval that survives contact with real documentation.*

One of the chunks in my RAG example kept reaching the top five results. Its heading was basically a stray brace from a code block.

It was not a bad search result in the usual sense. By the time the query arrived, the damage was already done. The RST loader had mistaken a line inside a code example for a section heading. It turned that line into its own document, embedded it, and stored it like everything else. The retriever did exactly what I had asked it to do: it searched an index that already had junk in it.

I added a small filter before vectorisation. The fragment disappeared, and so did the embedding call it would have cost. That is the part of RAG I underestimated at first: retrieval quality starts before there is anything to retrieve.

In the [previous article](/blog/rag-beyond-hello-world) I stayed at query time. Query rewriting, hybrid search and reranking all try to make better decisions once the index already exists. But they can only work with what indexing gave them, and indexing sets the ceiling for everything that happens later. None of those techniques can fix content that was chunked too bluntly, stripped of the detail that made it findable, or never indexed in a useful shape to begin with.

## Indexing is more than plumbing

The usual one-line description is: "load your documents, embed them, store the vectors." But each of those words hides a decision, and each decision shapes what "relevant" can mean for this corpus.

I find it helpful to see indexing as its own small pipeline, the mirror image of the query-time one:

![Index time, before the first query: load decides what enters the corpus, clean drops fragments that carry no meaning, chunk decides what retrieval can return, enrich adds what the text is missing (like the version), embed treats documents and queries differently, store freezes the earlier choices (a new model means re-indexing). Below, small: the query-time pipeline, which can only find what indexing kept.](/images/posts/indexing-for-rag-pipeline.png)

Every step depends on the choices made before it. A retriever can only ever return what indexing put into the store, in the shape indexing gave it.

None of these stages has one universally correct implementation. What matters here is knowing that each one exists, and what kind of retrieval failure it can create.

## What indexing actually decides

### Loading decides what enters the corpus

Loading decides the boundary of the corpus, and it is a separate decision from chunking: one decides what is available, the other decides the unit retrieval can return. A retriever cannot find a document that never entered the index, and including everything is not automatically better either. In the example, an `RstToctreeLoader` follows the Symfony documentation tree and decides which files enter the corpus, then hands each file to an RST-aware loader that does the actual splitting.

### Cleaning decides what survives into the index

Cleaning decides which parts of the loaded source are worth turning into retrievable units. Real documents carry navigation, generated fragments, malformed structure and code that may or may not be useful on its own, and loading a document does not mean every fragment of it deserves an embedding. In this example, the RST parser occasionally mistakes lines inside code blocks for headings and produces fragments with almost no retrievable meaning. One of those fragments is what opened this piece: a stray brace became a heading and still made it into the top five.

A small filter now removes those fragments before vectorisation, which also avoids paying to embed them. That filter is deliberately narrow. Code blocks, directives and cross-references still remain in the indexed text, and I do not yet know which of them help retrieval and which only add noise.

### Chunking decides what can be retrieved

The chunk is the atom of retrieval. If chunks are too large, one embedding has to represent several unrelated ideas at once, which weakens the signal for each one. If chunks are too small, each one loses the context that made it meaningful. The example does not treat every page as one document. It follows the structure already in the documentation and splits RST files at section headings. Only unusually large sections fall back to overlapping fixed-size chunks. That is a useful baseline because it keeps the boundaries the author already chose, but it is still not a rule that works everywhere. On a different corpus I would expect to spend most of my tuning time here, and I would not trust any chunk size until I tested it on that corpus myself.

### Enrichment adds the signal the text is missing

Enrichment is where information that exists around a document, but not necessarily inside it, becomes part of retrieval: version, publication date, product, language, tenant, permissions, content type. A reader picks up on this kind of signal without thinking, because they already know it, and the page itself usually does not spell it out. Indexing has to preserve that signal somewhere, either in the text sent to the embedding model or as explicit metadata the retriever can use later. What follows are a few examples of that, not a checklist.

My corpus had one obvious missing signal: the Symfony version. The documentation spans four versions, 4.4, 5.4, 7.4 and 8.0, and the retriever kept confusing them. So before embedding each document, I added its Symfony version to the start of the text. An 8.0 document, for example, started with "Symfony 8.0 documentation." That was the whole change. It is worth being honest about what kind of change it is: adding a sentence like that is a blunt instrument. It pushes the embedding toward version awareness by putting the version into the text itself, instead of storing the version as proper metadata you could filter on. It works well for this corpus and this problem. In my manual checks, the results began drifting less often between major versions once it was in place.

Indexing is also where you keep the metadata you will want later. The current example already captures the title, the source path and the depth as metadata. The Symfony version is not stored as its own field, although it can still be recovered from the source path. A production system would usually store the version as its own field too, so it could be filtered, shown next to citations, or used to break ties at query time, without parsing a path.

Enrichment can go further, for example by adding questions a chunk could answer, generated summaries or other representations designed specifically for retrieval.

### Embedding treats documents and queries differently

Embedding is not a neutral final step. Some retrieval-oriented embedding models have two separate modes, one for indexing content and one for searching it, and query and document vectors only line up for search if each side used the mode it was meant for. The example embeds documents with a Cohere model, which draws exactly this line: at index time the input is a document, at query time it is a query. Using the right mode on each side matters. The two are not interchangeable.

The larger point is that your embedding model has to match your corpus. Language coverage is one obvious example. A model chosen for English documentation may be a poor fit for a multilingual knowledge base.

### Storing is where the earlier choices become fixed

Storing is where every earlier choice becomes fixed. Change the embedding model later and you are not flipping a setting, you are rebuilding the index from scratch, even if the new model happens to use the same number of dimensions. Vectors from different models cannot be mixed in the same search. The store in this example is plain SQLite, which is enough to handle vector, text and hybrid queries.

## What I am not claiming

I am not claiming these are the right choices. This piece deliberately stays at the level of what decisions exist, not their exact tuned values. Those values are specific to this corpus, and I do not yet have solid numbers for the Symfony docs. The version-tag trick is a good example: it appeared to help consistently in my manual checks, but I would still want to see it work on another corpus before recommending it as a general pattern. I am not using a formal evaluation set for the claims in this piece. What I can show here is the same example before and after one change. The setup is public, and you can run the same comparison against your own data.

## Why this comes first

Indexing gets its own piece because it sets the ceiling. Query analysis and hybrid retrieval pick better among the candidates the index already produced. Reranking does the same job with a richer signal: it reads the query and a candidate together instead of relying on distance alone. None of them can invent a candidate that indexing threw away. None of them can recover a distinction that indexing failed to keep.

Put differently, this is where you put what you know about your own domain into the system. It is the same thread that runs through everything I write about AI tooling: making knowledge available to the model in a shape it can use, instead of hoping the model figures it out on its own.

From here, the series mixes hands-on tutorials with deeper looks at single parts. The runnable code for all of it lives in the [companion repository](https://github.com/wachterjohannes/rag-beyond-hello-world).
