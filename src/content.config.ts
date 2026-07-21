import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Blog posts live as Markdown in src/content/posts and are the data behind the
// home Featured/Latest sections and the blog index. Hero images are public
// paths (string) so the same URL works as the in-article <img> and the OG image.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.string(), // mono kicker, e.g. "// AI"
    readingTime: z.string(),
    heroImage: z.string(),
    heroAlt: z.string().default(''),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
