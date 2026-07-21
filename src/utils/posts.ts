import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

// Published posts, newest first. Drafts are excluded from every listing.
export async function getSortedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => data.draft !== true);
  return posts.sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
  );
}

// Unique tag list across published posts, alphabetical.
export async function getAllTags(): Promise<string[]> {
  const posts = await getSortedPosts();
  const set = new Set<string>();
  posts.forEach((p) => p.data.tags.forEach((t) => set.add(t)));
  return [...set].sort();
}
