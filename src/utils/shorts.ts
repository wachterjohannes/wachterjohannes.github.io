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
