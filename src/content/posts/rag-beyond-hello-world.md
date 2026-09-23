---
title: "RAG beyond hello world: retrieval is a pipeline"
description: "Most RAG demos retrieve something. Real documentation needs the right passages, ranked for what the user meant. Why retrieval is a pipeline, not a lookup."
pubDate: 2026-09-24
category: "// RAG"
readingTime: "7 min"
heroImage: "/images/posts/rag-beyond-hello-world-header.png"
heroAlt: "Header: RAG, part one. Retrieval is a pipeline. Query time: why naive RAG breaks on real docs."
tags: [ai, rag, symfony, php]
draft: false
---

*By Johannes Wachter, Sulu core developer and Symfony AI core team member. The first piece in a series about building retrieval that survives contact with real documentation.*

I asked my RAG example how to test sending emails in Symfony. It came back with the Mailer documentation three times, once from each of three different versions. Every result was about email. None of them held the section that actually explains how to test sending mail.

The vector search was working exactly as designed. That was the problem.

That is retrieval-augmented generation (RAG: look up material in your own sources first, then let a model answer from it) doing exactly what almost every tutorial teaches it to do. Embed the question, retrieve the nearest chunks from a vector store, and hand them to a model. It demos beautifully. Three files about pets are enough to get one confident answer to a single question.

Then you point the same code at real documentation and the answers get vague, cite the wrong version, or miss the one passage that actually held the answer.

RAG quality comes from a sequence of decisions about the query, the candidates, the ranking and the context, more than from the vector store itself. Retrieval is a pipeline, not a lookup. The rest of this series takes that pipeline apart one decision at a time.

You only need one mental model for this piece: an embedding represents a piece of text as numbers, and the vector store uses those numbers to find passages that are close in meaning. That works surprisingly well, until exact terminology or version boundaries begin to matter, or until the application needs something more specific than "close in meaning." The mechanics deserve a piece of their own.

This piece stays high level on purpose. Later pieces mix both: some keep this same altitude, others get hands-on with code. The retrieval questions are the same whether you already run a RAG pipeline in production or are still deciding where one might fit.

The example grew alongside work I was already doing in symfony/ai: the Cohere bridge, platform-level reranking, and the SQLite store itself. The repository became a place to compare how those pieces changed retrieval when used together. The complete example, including the slides from the talk this series grew out of, lives in the [rag-beyond-hello-world](https://github.com/wachterjohannes/rag-beyond-hello-world) repository and will evolve alongside this series.

## Where the hello world breaks

For that talk, I did not build a toy corpus. I indexed the real Symfony documentation across four versions: 4.4, 5.4, 7.4 and 8.0. That one choice creates a genuine problem, because now semantically similar sections from different versions compete with each other.

Ask a naive vector search for "send email" and you get a spread of results from several versions with almost identical scores. The retriever has no sense of what you meant or which version you are on, and no way to match an exact identifier like a class name. It found passages that are close in meaning, and nothing more.

The Mailer question from the opening is what this looks like up close: three versions, near-identical scores, and no sense of which one mattered or what was actually being asked. Everything past this point is about fixing retrieval rather than the model.

There is another pipeline before any query arrives: loading, cleaning, chunking, enriching and indexing the source material. Those decisions matter just as much, and they deserve their own piece. For now, I am focusing on what happens at query time, once the documents are already in the store.

![The retrieval pipeline. Index time, before any query: load, clean, chunk, enrich, embed, store. Query time: user question, query analysis, candidate generation (vector and full text), result fusion, reranking, context construction, answer generation. The four questions map onto it: 1 query analysis, 2 candidate generation and result fusion, 3 reranking, 4 context construction.](/images/posts/rag-beyond-hello-world-pipeline.png)

## Retrieval is four questions

While building the example, I gradually stopped seeing retrieval as one step. The failures kept falling into four questions, even though the implementation itself contains more individual stages. Each one is a place where a real system can go wrong, and each one can be answered in more than one way, depending on your own data and users.

### 1. Are we searching for the right thing?

The user typed "send email". The indexed documentation calls it "the Symfony Mailer component". Those are not the same string, and pure vector similarity only partly bridges the gap. Before retrieval, a small analysis step can rewrite the query: expand abbreviations, add the framework name, add version context, fix typos.

This is powerful and also where the first honest caveat lives. Rewriting the query can change the intent, and preferring a specific version is a product decision that depends on your users rather than a step every query needs. Once you rewrite, you want to keep the original query and the retrieval query separately traceable, so you can see what the system actually searched for. Some providers attack the same gap from the embedding side instead. Cohere, for example, treats queries and documents differently when creating embeddings (tuned for how people ask versus how documentation is written). That narrows the gap before any rewriting happens.

### 2. Are we generating the right candidates?

Vector search is good at meaning but unreliable with exact words and identifiers. Ask it for "Mailer" and the literal section can sit below three semantically fuzzy neighbours. Full-text search is better at exact terms and identifiers, but weaker when the user expresses the same intent in different words. One approach is to run both and combine their strengths, which is what hybrid retrieval does. In symfony/ai's SQLite store bridge, this is tuned by a semantic ratio: fully semantic at one end, fully keyword-based at the other, and balanced in the middle.

While building the example, I found that the existing merge of vector and text results did not rank the combined candidates consistently, so the work fed back upstream: the SQLite store now combines them with Reciprocal Rank Fusion, a standard way to combine ranked lists without pretending that vector-similarity scores and full-text scores are directly comparable.

### 3. Are the right candidates in the right order?

This is the question most of us skip, because we quietly assume retrieval and ranking are the same job, when retrieval only decides which documents make it into the pool and ranking decides what comes first. A reranker reads the query and each candidate together, giving it a richer relevance signal than embedding distance alone. That often improves the final ordering, but it also adds latency and cost, which is why it runs only on a small candidate pool that retrieval already narrowed down. In the example I used Cohere's reranker, and on the testing question it did exactly that job: it pulled the sections that actually cover testing up the list.

### 4. Are we giving the model the right context?

Only now does answer generation begin. Context construction still has decisions of its own. Duplicate passages can waste the token budget, and mixed versions can contradict each other in ways a model will not flag on its own. I ran into this while building the example, though not in the final version. Metadata and citation links can also disappear between retrieval and generation.

If the first three questions were answered well, this step is almost boring, which is the point. The model receives the right passages, in a sensible order, and writes them up without having to compensate for a bad context.

## What this is really about

Put the four questions back to back and a pattern shows up. Most RAG demos teach you how to retrieve something. A production system has to find the passages that match what the user actually meant and put the best of them first, before it generates anything. The vector store only answers part of question two.

This is the mirror image of the other thing I spend my time on, which is giving coding agents reliable access to a running application. There the question is how an agent gets trustworthy runtime knowledge. Here it is how a system builds trustworthy context out of a large body of documents. Both are the same underlying move: replacing guessing with better structured knowledge.

## What comes next

This is the starting point of a series. What happens before any query ever arrives deserves its own piece, and so do the hands-on tutorials built on symfony/ai that work through this same example one question at a time.

One honest note on the code: right now it runs against one corpus, the Symfony docs, and one provider, Cohere. That keeps the first comparisons clean, but it also means every claim in this piece stays qualitative. That does not change later in the series either. I am not building a formal evaluation set, so what you will see going forward is differences: the same example run before and after a change, without a scored evaluation of that specific change attached. Reproduce it yourself if you want to judge whether it helped, especially against your own dataset. A change that helps on the Symfony docs is no promise it helps on yours.
