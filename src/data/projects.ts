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
    docs: 'https://sulu.io',
  },
  {
    slug: 'symfony-mate',
    name: 'Symfony Mate',
    tagline: 'Runtime context for AI coding assistants, straight from your Symfony app.',
    badges: [['accent', 'symfony/ai'], ['neutral', 'dev tool'], ['neutral', 'PHP']],
    code: `$ composer require --dev symfony/ai-mate`,
    body: 'Symfony Mate is a development-only tool that gives AI coding assistants real runtime context from a Symfony application: the profiler, logs, container, router and events, instead of guessing from source files. I started it, and it lives in the symfony/ai monorepo as the symfony/ai-mate package.',
    github: 'https://github.com/symfony/ai-mate',
    docs: 'https://symfony.com/doc/current/ai/components/mate.html',
  },
  {
    slug: 'modelflow-ai',
    name: 'Modelflow-AI',
    tagline: 'A provider-agnostic PHP interface over multiple AI providers.',
    badges: [['warning', 'experimental'], ['neutral', 'PHP']],
    code: `$ composer require modelflow-ai/chat`,
    body: 'Modelflow-AI is a provider-agnostic PHP library. It puts one interface over several AI providers, covering chat, embeddings, image generation and tool calling, so switching provider is a small change rather than a rewrite. It is one of the open-source projects I work on in my free time.',
    github: 'https://github.com/modelflow-ai',
  },
  {
    slug: 'symfony-ai',
    name: 'symfony/ai',
    tagline: 'Contributor: AI integration for the Symfony framework.',
    badges: [['accent', 'contributor'], ['neutral', 'PHP']],
    body: 'I contribute to symfony/ai, the framework\'s AI integration: platform abstraction, agents, and store and RAG building blocks. Symfony Mate lives in the same monorepo.',
    github: 'https://github.com/symfony/ai',
  },
  {
    slug: 'pucene',
    name: 'Pucene',
    tagline: 'Lucene concepts reimplemented in pure PHP.',
    badges: [['warning', 'experiment'], ['neutral', 'PHP']],
    code: `$ composer require pucene/pucene`,
    body: 'An experiment in reimplementing Lucene concepts in pure PHP: the inverted index, scoring and analyzers. I built it to understand how Lucene actually works, not as a production search engine.',
    github: 'https://github.com/pucene',
  },
  {
    slug: 'php-task',
    name: 'PHP-Task',
    tagline: 'Schedule tasks inside your PHP application, not the crontab.',
    badges: [['neutral', 'library'], ['neutral', 'PHP']],
    code: `$ composer require php-task/task-bundle`,
    body: 'PHP-Task is a smaller library for scheduling tasks inside a PHP or Symfony application: cron-style scheduling, retries and handlers that live in the app instead of the system crontab. It is a modest, older project of mine.',
    github: 'https://github.com/php-task',
  },
  {
    slug: 'nanbando',
    name: 'Nanbando',
    tagline: 'An older backup tool for PHP applications.',
    badges: [['neutral', 'older project'], ['neutral', 'PHP']],
    code: `$ composer require nanbando/core`,
    body: 'Nanbando is an older backup tool for PHP applications. It wraps common backup strategies behind one command, with storage adapters such as local, S3 or FTP. It is a side project from a while ago rather than something I actively develop today.',
    github: 'https://github.com/nanbando',
  },
];

// Order used wherever the full list is shown (strongest first).
export const projectList = projects;

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
