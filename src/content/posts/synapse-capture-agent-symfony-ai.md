---
title: "An agent that files your notes, built with Symfony AI"
description: "A note-capturing agent with Symfony AI: tools as plain classes with #[AsTool], an agent configured in YAML, and a Vault class as the only code that touches the file system. Runs on 1.0.0-BETA1 with Cohere."
pubDate: 2026-11-01
category: "// SYMFONY AI"
readingTime: "10 min"
heroImage: "/images/posts/synapse-capture-agent-symfony-ai-header.png"
heroAlt: "Header: Synapse, part one. An agent that files your notes, behind one small Vault class."
tags: [ai, symfony, php, tutorial, agents]
draft: false
---

*By Johannes Wachter, Sulu core developer and Symfony AI core team member. Part one of a small tutorial series for the Symfony AI hackathon: an agent that decides what counts as knowledge.*

I am building a small second brain for the Symfony AI hackathon. Not because I need another note-taking app, but because it gives me a compact problem to build agents, tools, retrieval, MCP and permissions around. I call it Synapse, and this first part does one thing: hand an agent some text and let it decide whether it belongs in an inbox or becomes structured knowledge. Later parts add search, an MCP server and permissions. The hackathon itself runs for four weeks, from 26 October to 22 November 2026, to find out what still breaks in real use ahead of Symfony AI's 1.0 release. Nothing here is meant as a product I'd use myself: it is an illustration of how agents, tools, the AI Bundle and the MCP SDK/bundle fit together.

## What you will have at the end

By the end you can hand a piece of text to a command and find it as a markdown file in a folder, sorted by an agent. A rough thought lands in an `inbox/` folder. A clear piece of knowledge, for example a decision, becomes a structured note in `brain/`. Running the same input twice does not overwrite anything.

The part I find more interesting than the agent is how little of the file system it gets to see: one small class decides which paths exist at all.

## Assumptions

PHP 8.4 or newer, a Symfony 8.1 skeleton, Symfony AI at `^1.0@beta` (1.0.0-BETA1), and a Cohere API key. A free trial key is enough, because this part only sends short messages. The code lives on the branch `01-write-agent` of [wachterjohannes/synapse-tutorial](https://github.com/wachterjohannes/synapse-tutorial), and every later part is a branch of its own.

## Setup

```bash
composer create-project symfony/skeleton:"8.1.*" synapse-tutorial
cd synapse-tutorial
composer config minimum-stability beta
composer require symfony/ai-bundle:^1.0@beta symfony/ai-agent:^1.0@beta symfony/ai-cohere-platform:^1.0@beta
```

The `minimum-stability` line is the one I tripped over: the AI Bundle is not installable under the default `stable` setting while it is a beta, and Composer's message only mentions it at the end of a dependency chain ("found symfony/ai-platform[v1.0.0-BETA1] but it does not match your minimum-stability"), which is easy to read past. `symfony/ai-agent` is a separate package as well, and the bundle tells you so when an agent is configured without it. The key goes into `.env.local`:

```bash
echo 'COHERE_API_KEY=...' > .env.local
```

## The brain is a folder

I wanted something that works with no database, so the brain is a directory of markdown files in the [Open Knowledge Format](https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md) (OKF): every note is a markdown file with a small YAML header, and the only thing the format requires is a `type`. Two file names are reserved, `index.md` and `log.md`. That is all you need to know to follow this tutorial. Everything else the brain demands of a note is a house rule of this demo, and it lives in code you can read.

```
notes/
  inbox/    raw material, unsorted
  brain/    finished notes
    index.md
    log.md
```

The split is a design decision and not a technical need. A model that is unsure should have a place to put things that does not pretend to be knowledge yet, and the inbox is that place.

## One class owns the file system

The agent never gets a path-handling function. It gets five tools, and everything that touches a file goes through a `Vault` that knows exactly one root and one rule for what a valid path looks like:

```php
private function resolve(string $path): string
{
    if (!preg_match('#^(brain|inbox)/[a-z0-9][a-z0-9/_.-]*\.md\z#', $path)
        || str_contains($path, '..') || str_contains($path, '//')) {
        throw new \InvalidArgumentException(sprintf(
            '"%s" is not a valid note path. Notes live in brain/ or inbox/ and end with .md, for example brain/topics/mcp-auth.md.',
            $path,
        ));
    }

    $file = $this->root.'/'.$path;
    $this->assertInsideRoot($file, $path);

    return $file;
}
```

Two more decisions live in the same class. `create()` opens the file in exclusive mode, so it refuses to write when the file already exists and the agent can add notes but never replace one, and `update()` is only used for `brain/log.md`, which has to be rewritten when a new entry goes on top, under a lock so that two writers cannot lose each other's entry. The error message is written for the model as much as for a developer: it says what a valid path looks like, which is usually enough for the agent to correct itself on the next call.

## Five tools

A tool in Symfony AI is a class with the `#[AsTool]` attribute. The name and description are what the model sees, the constructor parameters are what get autowired, and the docblock `@param` lines become the argument descriptions. This is the inbox tool:

```php
#[AsTool('save_to_inbox', 'Saves raw, unsorted material as a new note in the inbox. Use this when you are unsure where the material belongs.')]
final class SaveToInbox
{
    public function __construct(private readonly Brain $brain)
    {
    }

    /**
     * @param string $slug short lowercase name with dashes, for example "mcp-auth-idea"
     * @param string $text the text of the note
     */
    public function __invoke(string $slug, string $text): string
    {
        try {
            return 'Saved '.$this->brain->saveToInbox($slug, $text);
        } catch (\InvalidArgumentException $e) {
            return 'Error: '.$e->getMessage();
        }
    }
}
```

The failure is returned as text instead of thrown. Symfony AI's toolbox catches an exception from a tool by default and lets the turn go on, but the model would only see that an error occurred while executing the tool, without the reason. A returned message tells it what to repair. On the development branch of Symfony AI, a `ToolErrorException` was added on 27 October for exactly this, so a later release will let a tool state the reason without returning text. The other tools follow the same shape: `list_notes`, `read_note`, `describe_format` and `save_to_brain`, which takes a type, title, description, tags and body and writes the OKF header itself, so the model never has to produce valid YAML by hand. `describe_format` is the one that does not write: it tells the model what a good note looks like, which is the next section.

## The format is checked in code

Before `save_to_brain` writes anything, an `OkfValidator` checks the note. It is a plain class without dependencies: a known type, the right folder for it, a body that starts with the title, and a few more rules. The messages are written for the model, so a rejected note comes back as text it can fix:

```
Error: A Decision needs a section "## Consequences".
```

The rules live in one place, [`config/okf.yaml`](https://github.com/wachterjohannes/synapse-tutorial/blob/01-write-agent/config/okf.yaml): the types, a folder and the required sections for each, and one short example body. The validator reads that file to check a note, and the `describe_format` tool reads the same file to show the agent what to write. The prompt only says to call the tool before saving, so the rules cannot drift apart between the prompt and the code. [`src/Brain/OkfValidator.php`](https://github.com/wachterjohannes/synapse-tutorial/blob/01-write-agent/src/Brain/OkfValidator.php) is where they are enforced. I will not repeat the list here, because the file is shorter than my description of it. Notes the agent writes are marked `status: draft`, and only a person would ever change that.

## The agent

The agent is configuration plus a prompt file:

```yaml
ai:
    platform:
        cohere:
            api_key: '%env(COHERE_API_KEY)%'

    agent:
        capturer:
            platform: 'ai.platform.cohere'
            model: 'command-a-03-2025'
            max_tool_calls: 10
            prompt:
                file: '%kernel.project_dir%/config/ai/capturer.md'
            tools:
                - 'App\Ai\ListNotes'
                - 'App\Ai\ReadNote'
                - 'App\Ai\SaveToInbox'
                - 'App\Ai\DescribeFormat'
                - 'App\Ai\SaveToBrain'
```

The prompt is short and ordered. Call `list_notes` first, read a note if the subject already exists, then decide: when the material is rough or the agent is unsure, it goes to the inbox, and when it is a clear, self-contained piece of knowledge the agent asks `describe_format` for the shape and writes a brain note. Facts that are not in the material must not be invented, and existing notes are never changed.

A console command is the whole interface. The agent is injected by its name, and `call()` returns an execution object whose content is the answer:

```php
#[AsCommand('app:capture', 'Hands raw material to the capture agent, which files it in the brain')]
final class CaptureCommand
{
    public function __construct(#[Target('capturer')] private readonly AgentInterface $agent)
    {
    }

    public function __invoke(SymfonyStyle $io, #[Argument('The raw text to capture')] string $text): int
    {
        $io->writeln($this->agent->call($text)->getContent());

        return 0;
    }
}
```

## Verify it

I ran three inputs against the real model. A vague idea first:

```
$ php bin/console app:capture "idea: what if the reader agent could also answer from a reading list? not sure how yet"
I have saved your idea in inbox/2026-10-27-reader-agent-reading-list.md.
```

Then a clear decision:

```
$ php bin/console app:capture "Decision: we use Cohere command-a for all agents in the demo, because one API key covers chat, embeddings and rerank."
I have saved your decision to brain/decisions/use-cohere-command-a-for-all-agents-in-the-demo.md.
```

The decision became a note with a `type: Decision`, a title, a description, tags, `status: draft` and a `generated` entry that names who wrote it and when, and `brain/log.md` gained a dated entry. Sending the identical decision a second time was the case I cared about:

```
The decision to use Cohere command-a for all agents in the demo has already been made and documented.
```

The agent looked at `list_notes` before writing and found the earlier note, so there was no duplicate and no overwrite. This is a model's judgement, and I would not rely on it alone: the second layer is the `Vault`, which refuses the write even when the agent decides otherwise. You can check that part without a model. Without `-v` the script prints nothing and exits 0 when every rule holds:

```
$ php tools/okf-check.php -v
brain/../../.env => "brain/../../.env" is not a valid note path. Notes live in brain/ or inbox/ and end with .md, for example brain/topics/mcp-auth.md.
brain/topics/x.txt => "brain/topics/x.txt" is not a valid note path. Notes live in brain/ or inbox/ and end with .md, for example brain/topics/mcp-auth.md.
/etc/passwd.md => "/etc/passwd.md" is not a valid note path. Notes live in brain/ or inbox/ and end with .md, for example brain/topics/mcp-auth.md.
brain//x.md => "brain//x.md" is not a valid note path. Notes live in brain/ or inbox/ and end with .md, for example brain/topics/mcp-auth.md.
brain/decisions/use-hyphens.md => The note "brain/decisions/use-hyphens.md" already exists. Pick another name.
```

The branch ships `bin/smoke`, which checks the wiring without a key and runs the capture command for real with one.

## A short note on write access

An agent with write access can put things in the wrong place, and a model will occasionally do that. That is why the demo keeps `notes/` in Git, so every change is a diff you can read and revert, and why the `Vault` is as strict as it is. A path check on the string cannot see a symlink, so `resolve()` also looks at the closest existing part of the path and requires that it still sits below the vault root, and it never follows a symlink as the note itself. For a real project I would think harder about who can send text to such an agent too, since captured text is also input, but that is a different tutorial.

## Where this stops

The capture agent writes blind. It can list names and read single notes, but it cannot find a note by meaning, so a duplicate under a different wording will get through. Search is the next thing the brain needs, and it is the point where retrieval comes in. For the details of how that works I would point you to the [RAG series](/rag) rather than repeat it here.
