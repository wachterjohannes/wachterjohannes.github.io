// Ported from ui_kits/website/Project.jsx PROJECTS. All em-dashes in the copy
// have been converted to commas/colons (Johannes' hard rule). Drives the nav
// dropdown, the /projects index and the /projects/[slug] detail pages.

export type BadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  badges: [BadgeVariant, string][];
  code: string;
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

$ bin/adminconsole sulu:build dev
  ✓ admin built, database ready`,
    body: 'Sulu is an open-source content management system built on Symfony, for building and running content-rich sites and custom web applications. The backend is PHP and Symfony, the admin is a modern React interface. I am one of its core developers and have worked on it since 2013, mostly on the backend, though on a small team everyone does what is needed.',
    github: 'https://github.com/sulu/sulu',
    docs: 'https://sulu.io',
  },
  {
    slug: 'symfony-mate',
    name: 'Symfony Mate',
    tagline: 'Your companion for building and maintaining Symfony applications.',
    badges: [['accent', 'v1.2'], ['success', 'stable']],
    code: `$ composer require --dev symfony/ai-mate

$ bin/console mate:analyse src/
  ✓ 142 services checked, 3 suggestions`,
    body: 'Symfony Mate grew out of years of Symfony consulting, it automates the checks and refactorings I kept doing by hand on client projects. It is a development-only MCP server that lets AI assistants look inside a running app: profiler, logs and container, instead of guessing from source files.',
    github: 'https://github.com/symfony/ai-mate',
    docs: 'https://symfony.com/doc/current/ai/components/mate.html',
  },
  {
    slug: 'modelflow-ai',
    name: 'Modelflow-AI',
    tagline: 'A unified PHP interface for working with different AI models and providers.',
    badges: [['accent', 'v0.3'], ['warning', 'experimental']],
    code: `$ composer require modelflow-ai/chat

$handler = new AIChatRequestHandler($adapter);
$response = $handler->createRequest(
    new AIChatMessage(Role::User, 'Hello world!')
)->execute();`,
    body: 'In my free time I am working on different open-source projects, Modelflow-AI is the newest one. It abstracts chat, embeddings and image generation behind one consistent API, so switching between providers is a one-line change.',
    github: 'https://github.com/modelflow-ai',
  },
  {
    slug: 'symfony-ai',
    name: 'symfony/ai',
    tagline: 'Contributor: AI integration for the Symfony framework.',
    badges: [['accent', 'contributor']],
    code: `$ composer require symfony/ai

$agent = new Agent($platform, $model);
$result = $agent->call($messages);`,
    body: 'I contribute to symfony/ai, bringing lessons from Modelflow-AI into the framework: platform abstraction, agents, RAG building blocks. Symfony Mate lives in the same monorepo.',
    github: 'https://github.com/symfony/ai',
  },
  {
    slug: 'pucene',
    name: 'Pucene',
    tagline: 'Lucene concepts implemented in pure PHP.',
    badges: [['warning', 'experiment']],
    code: `$ composer require pucene/pucene

$pucene->index()->add($document);
$hits = $pucene->search($query);`,
    body: 'An experiment in reimplementing inverted indexes, scoring and analyzers without the JVM, built to understand how Lucene actually works.',
    github: 'https://github.com/pucene',
  },
  {
    slug: 'php-task',
    name: 'PHP-Task',
    tagline: 'Long-running task scheduler for PHP applications.',
    badges: [['accent', 'v2.0'], ['success', 'stable']],
    code: `$ composer require php-task/task-bundle

$scheduler->createTask('newsletter', $workload)
    ->cron('0 9 * * 1')->schedule();`,
    body: 'PHP-Task brings cron-style scheduling, retries and handlers into the application itself instead of the crontab.',
    github: 'https://github.com/php-task',
  },
  {
    slug: 'nanbando',
    name: 'Nanbando',
    tagline: 'Going-to-be-easiest backup solution for PHP applications.',
    badges: [['accent', 'v0.8'], ['success', 'stable']],
    code: `$ composer require nanbando/core

$ nanbando backup
  ✓ database, uploads → local + S3`,
    body: 'Nanbando wraps backup strategies for typical PHP applications behind one command: plug in local, S3 or FTP storage.',
    github: 'https://github.com/nanbando',
  },
];

// Nav order for the dropdown (matches the original kit's menu order).
export const projectList = projects;

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
