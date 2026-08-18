import { getCollection, type CollectionEntry } from 'astro:content';

export type Short = CollectionEntry<'shorts'>;

const byNewest = (a: Short, b: Short) =>
  b.data.pubDate.getTime() - a.data.pubDate.getTime();

// Every short, newest first. Drives the /shorts index and the detail pages.
// Shorts have no draft/archived/unlisted split: a short is published or it is
// still sitting in the content repo.
export async function getSortedShorts(): Promise<Short[]> {
  return (await getCollection('shorts')).sort(byNewest);
}

// Unique tag list across the shorts, alphabetical.
export async function getAllShortTags(): Promise<string[]> {
  const shorts = await getSortedShorts();
  const set = new Set<string>();
  shorts.forEach((s) => s.data.tags.forEach((t) => set.add(t)));
  return [...set].sort();
}

// The index teases, the short's own page is where it is read: the first sentence
// or two, never a sentence cut in half. The character ceiling is a guard against a
// long opening sentence, not the thing that normally decides the length.
const EXCERPT_SENTENCES = 2;
const EXCERPT_CHARS = 240;

// Markdown to one line of plain prose, so an excerpt never ends mid-syntax:
// links become their text, backticks go, whitespace collapses.
export function plainText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// `truncated` is measured against the whole short, so the ellipsis only shows up
// when there is genuinely more to read.
export function excerpt(text: string): { text: string; truncated: boolean } {
  const full = plainText(text);
  if (full.length <= EXCERPT_CHARS) return { text: full, truncated: false };

  let out = '';
  for (const sentence of full.split(/(?<=[.!?])\s+/).slice(0, EXCERPT_SENTENCES)) {
    if (out && `${out} ${sentence}`.length > EXCERPT_CHARS) break;
    out = out ? `${out} ${sentence}` : sentence;
  }
  // A first sentence longer than the cap on its own: cut at a word boundary.
  if (out.length > EXCERPT_CHARS) out = out.slice(0, EXCERPT_CHARS).replace(/\s+\S*$/, '');

  return { text: out, truncated: out.length < full.length };
}
