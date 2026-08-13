// Project data behind the nav link target (/projects), the /projects index and
// the /projects/[slug] detail pages. Copy is honest: no invented version numbers,
// no fabricated command output, no made-up counts or backstory. Where a real
// version or a safe snippet is not known, it is left out rather than invented.
// No em-dashes anywhere (Johannes' hard rule).

export type BadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  badges: [BadgeVariant, string][];
  code?: string; // optional: only a real, plausible command, never fabricated output
  body: string;
  github: string;
  docs?: string;
  story?: string; // slug of an archived origin-story post, linked on the detail page
  read?: string; // slug of a current (non-archived) blog post about the project
}

export const projects: Project[] = [
  {
    slug: 'sulu',
    name: 'Sulu',
    tagline: 'The open-source CMS built on Symfony, for content-rich sites and custom web apps.',
    badges: [['accent', 'flagship'], ['success', 'stable'], ['neutral', 'Symfony'], ['neutral', 'PHP'], ['neutral', 'React']],
    code: `$ composer create-project sulu/skeleton my-app

$ bin/adminconsole sulu:build dev`,
    body: 'Sulu is an open-source content management system built on Symfony, for building and running content-rich sites and custom web applications. The backend is PHP and Symfony, the admin is a modern React interface. I am one of its core developers and have worked on it since 2013, mostly on the backend, though on a small team everyone does what is needed.',
    github: 'https://github.com/sulu/sulu',
    docs: 'https://docs.sulu.io',
  },
  {
    slug: 'symfony-mate',
    name: 'Symfony Mate',
    tagline: 'Runtime context for AI coding assistants, straight from your Symfony app.',
    badges: [['success', 'active'], ['neutral', 'dev tool'], ['neutral', 'Symfony'], ['neutral', 'PHP']],
    code: `$ composer require --dev symfony/ai-mate`,
    body: 'Symfony Mate is a development-only tool that gives AI coding assistants real runtime context from a Symfony application: the profiler, logs, container, router and events, instead of guessing from source files. I started it, and it lives in the symfony/ai monorepo as the symfony/ai-mate package.',
    github: 'https://github.com/symfony/ai-mate',
    docs: 'https://symfony.com/doc/current/ai/components/mate.html',
    read: 'giving-ai-assistants-eyes',
  },
  {
    slug: 'modelflow-ai',
    story: 'introducing-modelflow-ai',
    name: 'Modelflow-AI',
    tagline: 'A provider-agnostic PHP interface over multiple AI providers.',
    badges: [['warning', 'superseded'], ['neutral', 'PHP']],
    code: `$ composer require modelflow-ai/chat`,
    body: 'Modelflow-AI is a provider-agnostic PHP library. It puts one interface over several AI providers, covering chat, embeddings, image generation and tool calling, so switching provider is a small change rather than a rewrite. Its ideas are moving into symfony/ai, so I no longer actively maintain the library myself.',
    github: 'https://github.com/modelflow-ai',
  },
  {
    slug: 'symfony-ai',
    name: 'symfony/ai',
    tagline: 'Symfony AI Core Team: AI integration for the Symfony framework.',
    badges: [['accent', 'core team'], ['success', 'active'], ['neutral', 'PHP']],
    body: 'I\'m part of the Symfony AI Core Team, working on the framework\'s AI integration: platform abstraction, agents, and store and RAG building blocks. Symfony Mate lives in the same monorepo. Ideas from Modelflow-AI are flowing into it, which is where that work continues now.',
    github: 'https://github.com/symfony/ai',
    docs: 'https://ai.symfony.com',
  },
  {
    slug: 'pucene',
    story: 'pucene-vision',
    name: 'Pucene',
    tagline: 'Lucene concepts reimplemented in pure PHP.',
    badges: [['warning', 'experimental'], ['neutral', 'PHP']],
    code: `$ composer require pucene/pucene`,
    body: 'An experiment in reimplementing Lucene concepts in pure PHP: the inverted index, scoring and analyzers. I built it to understand how Lucene actually works, not as a production search engine.',
    github: 'https://github.com/pucene',
  },
  {
    slug: 'php-task',
    story: 'php-task-basic-ideas',
    name: 'PHP-Task',
    tagline: 'Schedule tasks inside your PHP application, not the crontab.',
    badges: [['success', 'in use'], ['neutral', 'PHP']],
    code: `$ composer require php-task/task-bundle`,
    body: 'PHP-Task is a library for scheduling tasks inside a PHP or Symfony application: cron-style scheduling, retries and handlers that live in the app instead of the system crontab. It is one of the lab projects I still maintain and rely on in real applications, and it is actively used by the SuluAutomationBundle.',
    github: 'https://github.com/php-task',
  },
  {
    slug: 'nanbando',
    story: 'nanbando-basic-ideas',
    name: 'Nanbando',
    tagline: 'A backup tool for PHP applications.',
    badges: [['success', 'in use'], ['neutral', 'PHP']],
    code: `$ composer require nanbando/core`,
    body: 'Nanbando is a backup tool for PHP applications. It wraps common backup strategies behind one command, with storage adapters such as local, S3 or FTP. It is one of my lab projects that I still maintain and rely on.',
    github: 'https://github.com/nanbando',
  },
];

// Order used wherever the full list is shown (strongest first).
export const projectList = projects;

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
