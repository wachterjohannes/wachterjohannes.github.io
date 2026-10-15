---
title: "How embeddings and vector stores actually work"
description: "An embedding turns text into numbers and a vector store finds what is close in meaning. Here is what that actually does, and the one blind spot that shapes every RAG pipeline."
pubDate: 2026-10-15
category: "// RAG"
readingTime: "7 min"
heroImage: "/images/posts/embeddings-and-vector-stores-header.png"
heroAlt: "Header: RAG foundations. How embeddings and vector stores actually work."
tags: [ai, rag, symfony, php]
audio: "/audio/embeddings-and-vector-stores-en.mp3"
audioLabel: "Spoken version of this post, 9 min"
draft: false
---

*By Johannes Wachter, Sulu core developer and Symfony AI core team member. The foundations piece in a series about building retrieval that survives contact with real documentation.*

In my RAG example, a search for "send email" finds the page about Symfony's Mailer component, although the two share no words. A search for "Mailer" can rank that same page below three others that are merely about email. Both results come from the same mechanism, and understanding why gives you most of the mental model you need for using embeddings in retrieval.

In the [first piece of this series](/blog/rag-beyond-hello-world) I only needed one sentence of mental model: an embedding turns text into numbers, and a vector store uses those numbers to find passages that are close in meaning. This piece opens that sentence up. The mechanics are not hard. Their limits explain many of the decisions that come later at query time, and once you see what the numbers can and cannot represent, hybrid search, reranking and query analysis look less like a bag of tricks and more like answers to a specific problem.

## What an embedding actually is

An embedding model takes a piece of text and returns a fixed-length list of numbers. In the example this series is built on, the model is Cohere's embed-english-v3.0, and every document comes back as 1024 numbers. That list is a point in a space with 1024 axes. You cannot picture 1024 dimensions, and you do not need to. The only thing that matters is that the model was trained so that texts with similar meaning land near each other in that space, and texts with unrelated meaning land far apart.

The important word is trained. Nobody wrote rules that map "send email" to a particular region. The model learned the arrangement from a very large amount of text, and that arrangement encodes meaning as position. It is why an embedding can put "send email" close to a page about the Symfony Mailer component even though the two share no words. It is also why the same mechanism does not guarantee that "Mailer" as an exact identifier outranks documents that are merely close to it in meaning. The embedding contains lexical information too, but exact matching is not the job the retrieval method is optimised for.

## Numbers become a point in space

Take three German words: *Haus* (house), *Maus* (mouse) and *Ratte* (rat). A deliberately simple model could place each one on a single axis, scored by how similar its spelling looks to the others: Haus 42, Maus 40, Ratte 30. On that axis, *Haus* and *Maus* sit close together, which fits their spelling but misses that *Maus* and *Ratte* are related in meaning.

A second axis, scored for meaning instead, changes the picture: Haus 50, Maus 26, Ratte 25. Each word is now a point in a two-dimensional space rather than on a single line. *Haus* and *Maus* are still close on the spelling axis but far apart on the meaning axis, and *Maus* and *Ratte* are the reverse: further apart in spelling, almost aligned in meaning. The straight-line distance between two points makes that precise: *Haus* to *Maus* works out to about 24, *Maus* to *Ratte* to about 10. With both axes counted, *Maus* ends up far closer to *Ratte* than to *Haus*, the opposite of what the spelling axis alone suggested.

That is the intuition an embedding scales up: coordinates learned from data instead of chosen by hand, hundreds or thousands of axes instead of two, and comparisons that tend to use cosine similarity rather than the straight-line distance used here. An axis in a real model rarely lines up with a clean label like "spelling" or "meaning", but the toy version still shows what adding a dimension buys: it can change which relationship the representation emphasises, not just how precisely it measures the one it already had.

## What "close in meaning" actually means

If meaning is represented as position, similarity becomes a geometric comparison. A common one is cosine similarity, or the corresponding cosine distance: it compares the direction of two vectors rather than treating them as points whose straight-line distance matters. When you embed a query, the store turns your question into a point in the same space and looks for the stored points nearest to it. For the mental model, the important part is simpler: the store can rank documents by how close their vectors are to the query vector, and returns the closest handful.

You can search by meaning instead of by keyword, and it degrades gracefully: a roughly worded question still lands somewhere sensible. It is also why semantic retrieval alone is not enough: the closest point in the space and the answer the reader wanted can turn out to be two different things.

## Three words that get used interchangeably

It helps to separate three terms that often blur together.

A **vector** is the list of numbers itself: the embedding of one piece of text.

A **vector store** is whatever holds those vectors and can find the nearest ones to a query. The word describes a capability.

A **vector database** is a data system designed specifically around vector search, usually adding specialised indexing, filtering, persistence and scaling around that capability.

The distinction matters because you can have the capability without the product. In this example the store is plain SQLite. It holds the vectors and the original text, and it can do both similarity search and keyword search, with no extra service to deploy. Whether you ever need a dedicated vector database is a separate question. For understanding the mechanics, the store is just the thing that keeps the points and finds the near ones.

## Why the model choice is stickier than it looks

Two properties matter once you stop treating the vectors as temporary values and actually build an index around them.

The first is that the number of dimensions is fixed by the model. embed-english-v3.0 always returns 1024 values. A different model returns a different length, and even a model with the same length produces a different arrangement, because it learned its own space. In practice, vectors from two independently trained embedding models have to be treated as incompatible. This is why changing the embedding model triggers a re-index: every document has to be embedded again with the new model before anything can be searched.

The second is that the model and the corpus have to match. An English model on English documentation is a sensible starting point, but the same model may be a poor fit for a multilingual knowledge base. Language coverage is one of the things worth checking before committing to a model. There is also a smaller asymmetry worth knowing: some models (Cohere's among them) embed a document and a search query in slightly different modes so the two sides line up. In the version of symfony/ai used by the companion example, the query side was quietly using the document mode, because that is the default, and nothing failed loudly; it only showed up on a closer look at what came back.

## Where the mental model breaks, on purpose

Semantic similarity is not the same as relevance, and this is the honest centre of the piece.

An embedding places text by overall meaning. That is exactly what you want when the user's words and the document's words differ, and exactly what fails when the difference that matters is not about meaning at all. Ask for an exact identifier, such as a component or class name, and vector search can rank the literal page below three fuzzy neighbours, because none of them are far apart in meaning. Index several versions of the same documentation and the versions sit almost on top of each other, because they mean nearly the same thing. The geometry works as designed and still cannot see the distinction you care about.

This is where the earlier articles connect. Full-text search restores a signal semantic retrieval is deliberately weak at: exact terms. Reranking adds another kind of signal entirely, reading the query and a candidate together instead of judging them only by their independently produced vectors. In the example, SQLite supports both vector and full-text retrieval. A hybrid query can weight the two through a semantic ratio, from fully semantic to fully lexical, and the store combines the resulting rankings with Reciprocal Rank Fusion. RRF matters because a cosine distance and a full-text relevance score do not live on a comparable scale. Instead of pretending they do, it combines their ordering. Those stages leave the embeddings as they are and cover what embeddings, by their nature, cannot do.

## The useful way to hold it

An embedding is a learned representation of text as a position in a vector space, and a vector store is a way to retrieve nearby representations. That proximity is useful, but it is not the same thing as relevance for a particular question. Seen that way, much of the machinery we add at query time exists to compensate for the things semantic proximity alone cannot express.
