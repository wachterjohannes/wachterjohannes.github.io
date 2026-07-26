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
  hidden?: boolean; // when true, the hub page is not built yet (hold it until launch day)
}

export const series: Series[] = [
  {
    slug: 'mate',
    kicker: '// MATE',
    title: 'Symfony Mate',
    tagline: 'Give coding agents reliable access to your running app, and the know how to use it.',
    intro:
      'A running thread through my work: a coding agent can read your code but cannot look into the running application, so it guesses. Mate is the tool that gives it the right tools instead. These pieces are the thinking around it, from what it should expose, to how you distribute know how to agents, to why the transport was never the point.',
    pieces: [
      {
        title: 'Giving AI assistants eyes',
        blurb: 'What Mate is: tools that let a coding agent look into a running Symfony app, not just read its code.',
        slug: 'giving-ai-assistants-eyes',
        kind: 'article',
      },
      {
        title: 'Skills over MCP: shipping Symfony know-how with Mate',
        blurb: 'Serving know how to agents over the same connection as the tools.',
        slug: 'skills-over-mcp',
        kind: 'article',
      },
      {
        title: 'The last mile: distributing Agent Skills to real agents',
        blurb: 'No agent reads Skills over MCP yet. Getting them onto the filesystem agents actually watch.',
        slug: 'the-last-mile',
        kind: 'article',
      },
      {
        title: 'The wrong debate: what PHP taught me about agentic software',
        blurb: 'MCP or CLI is the wrong fight. What PHP already learned about building things together, one layer down.',
        slug: 'the-wrong-debate',
        kind: 'article',
      },
      {
        title: 'Kill the MCP',
        blurb: 'I deleted the MCP server from my own MCP project and kept the tools. Kill the reflex, not the protocol.',
        slug: 'kill-the-mcp',
        kind: 'article',
      },
      {
        title: 'The Mate journey: how an idea became a tool',
        blurb: 'From skeptic to contributor, an homage to the Symfony community and the symfony/ai initiative.',
        slug: 'the-mate-journey',
        kind: 'article',
      },
    ],
  },
  {
    slug: 'rag',
    hidden: true, // goes live with the first RAG article on 2026-07-29 (flip to false + deploy that day)
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
