// Topic hub definitions. Each series gets a top-level page at /<slug> (e.g. /rag)
// that lists the whole planned arc, so it can be linked to in advance, from talks,
// social posts or other articles, even before every piece is published.
//
// A piece links to /blog/<slug> as soon as a published (non-draft) post with that
// id exists; until then it shows as "Coming soon". Keep each piece's `slug` equal
// to the intended post filename so it wires up automatically on publish.

export interface SeriesPiece {
  title: string;
  blurb: string;
  slug: string; // intended /blog/<slug>
  kind?: 'article' | 'tutorial';
}

export interface Series {
  slug: string; // hub URL: /<slug>
  kicker: string; // mono kicker, e.g. "// RAG"
  title: string;
  tagline: string;
  intro: string;
  pieces: SeriesPiece[];
}

export const series: Series[] = [
  {
    slug: 'rag',
    kicker: '// RAG',
    title: 'RAG beyond hello world',
    tagline: 'Retrieval is a pipeline, not a lookup.',
    intro:
      'A series on building retrieval that survives contact with real documentation. It starts where most tutorials stop, with the naive version, and walks through the decisions that actually move quality: what you index, what you search for, which candidates you generate, how you rank them, and how you know any of it got better. Built in the open with symfony/ai.',
    pieces: [
      {
        title: 'RAG beyond hello world: retrieval is a pipeline',
        blurb: 'The mental model. Why the naive version breaks on real docs, and the four questions retrieval really is.',
        slug: 'rag-beyond-hello-world',
        kind: 'article',
      },
      {
        title: 'Retrieval quality is decided before the first query',
        blurb: 'The indexing side: loading, chunking and enriching the source before anyone searches it.',
        slug: 'indexing-for-rag',
        kind: 'article',
      },
      {
        title: 'Building a minimal RAG pipeline with Symfony AI',
        blurb: 'The deliberate hello world: index, embed, retrieve, answer. Then see where it breaks.',
        slug: 'minimal-rag-pipeline-symfony-ai',
        kind: 'tutorial',
      },
      {
        title: 'Your users do not write search queries',
        blurb: 'Query analysis: rewriting what the pipeline searches for, and where that goes wrong.',
        slug: 'query-analysis-for-rag',
        kind: 'tutorial',
      },
      {
        title: 'Semantic search is not enough',
        blurb: 'Hybrid retrieval: combining vector and full text with Reciprocal Rank Fusion.',
        slug: 'semantic-search-is-not-enough',
        kind: 'tutorial',
      },
      {
        title: 'Retrieval is not ranking',
        blurb: 'Reranking: a cross-encoder rescoring the candidates retrieval narrowed down.',
        slug: 'retrieval-is-not-ranking',
        kind: 'tutorial',
      },
      {
        title: 'How do you know your RAG system got better?',
        blurb: 'Evaluation: a small reproducible set, and real numbers instead of "looks better".',
        slug: 'evaluating-rag',
        kind: 'tutorial',
      },
      {
        title: 'RAG retrieves. Agents investigate.',
        blurb: 'Agentic search: letting the model steer the research with search, grep, read and prune.',
        slug: 'rag-retrieves-agents-investigate',
        kind: 'article',
      },
    ],
  },
];
