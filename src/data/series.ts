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
    slug: 'ownership',
    kicker: '// OWNERSHIP',
    title: 'Ownership',
    tagline: 'Who owns the consequences once implementation stops being the hard part.',
    intro:
      'Building software has become cheap, and the arguments about it are mostly about speed. The part that stayed expensive is the one nobody photographs: somebody has to hold the context, carry the maintenance and answer for the system a year later. These pieces circle that question from three directions, from a classroom, from a team of six, and from the current enthusiasm for building without developers.',
    pieces: [
      {
        title: 'What happens to innovation when implementation becomes almost free?',
        blurb: 'When code, design and content all get cheap, the bottleneck moves. A note from the classroom about where excellence still shows up.',
        slug: 'when-implementation-becomes-free',
        kind: 'article',
      },
      {
        title: 'Why six people are enough and what coding agents have to do with it',
        blurb: 'Six developers run Sulu and its projects. Ownership and context are what make that work, and agents need the same things.',
        slug: 'why-six-people-are-enough',
        kind: 'article',
      },
      {
        title: 'Vibe coding is no-code without a custodian',
        blurb: 'Another attempt at software without developers. The difference to no-code is not the abstraction level, it is that nobody is left to look after it.',
        slug: 'vibe-coding-without-a-custodian',
        kind: 'article',
      },
    ],
  },
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
        title: 'The Mate Lab: does an agent actually use a dev tool?',
        blurb: 'Measuring whether an agent reaches for Mate unprompted, MCP server against bare CLI against a file-based discovery layer.',
        slug: 'mate-lab',
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
    slug: 'agentic-software',
    kicker: '// AGENTIC SOFTWARE',
    title: 'Agentic Software',
    tagline: 'The debates worth having about how software actually gets built for agents.',
    intro:
      'Agentic software collects protocol debates faster than working software does: MCP versus CLI, servers versus tools, specs versus what agents actually read. These pieces argue from what I actually shipped and broke while building Mate, not from the spec: why getting Skills onto the filesystem mattered more than the standard did, what PHP already learned about building things together one layer down, and why I killed the MCP server in my own MCP project.',
    pieces: [
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
    ],
  },
  {
    slug: 'rag',
    hidden: true, // RAG is postponed indefinitely (Johannes, 2026-08-04). No date. Flip to false on the day the first RAG article actually ships, not before.
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
        title: 'How embeddings and vector stores actually work',
        blurb: 'What a vector really is, how embeddings are produced, and what separates a vector store from a plain database. The foundation the earlier pieces leaned on.',
        slug: 'embeddings-and-vector-stores',
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
