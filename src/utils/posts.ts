import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

const byNewest = (a: Post, b: Post) =>
  b.data.pubDate.getTime() - a.data.pubDate.getTime();

// Every published post (regular + archived), newest first. Used to generate the
// post detail pages.
export async function getAllPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => data.draft !== true);
  return posts.sort(byNewest);
}

// Regular (non-archived, non-unlisted) posts, newest first. Drives the home
// Featured/Latest and the main blog index. Archived and unlisted posts are
// excluded here on purpose.
export async function getSortedPosts(): Promise<Post[]> {
  return (await getAllPosts()).filter((p) => p.data.archived !== true && p.data.unlisted !== true);
}

// Archived posts (migrated from asapo.at), newest first. Drives /archive.
export async function getArchivedPosts(): Promise<Post[]> {
  return (await getAllPosts()).filter((p) => p.data.archived === true);
}

// Unique tag list across the regular (non-archived) posts, alphabetical.
export async function getAllTags(): Promise<string[]> {
  const posts = await getSortedPosts();
  const set = new Set<string>();
  posts.forEach((p) => p.data.tags.forEach((t) => set.add(t)));
  return [...set].sort();
}
