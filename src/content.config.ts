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
    heroImage: z.string().optional(),
    heroAlt: z.string().default(''),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    // Optional: the published LinkedIn version of this post. When set, the post
    // renders a "Discuss on LinkedIn" link. Absent means no link is shown.
    linkedin: z.string().url().optional(),
    // Archived posts (migrated from the old asapo.at site) are shown only on
    // /archive, never in the home Featured/Latest or the main blog index.
    archived: z.boolean().default(false),
    source: z.string().url().optional(), // original asapo.at URL
    // Cross-post: this piece was first published elsewhere. canonicalUrl keeps
    // the SEO weight with the original instead of competing with it, and
    // originalPublisher names it in the visible note above the article.
    canonicalUrl: z.string().url().optional(),
    originalPublisher: z.string().optional(),
    // Language of the post body, for the <html lang> attribute. Defaults to
    // English since that's every post so far.
    lang: z.enum(['en', 'de']).default('en'),
    // Live at its own URL and fully functional, but deliberately not linked or
    // listed anywhere on the site (home, blog index, archive, RSS, tags,
    // "next up" suggestions on other posts). For a quiet publish, e.g. a
    // translation Johannes wants up without promoting it.
    unlisted: z.boolean().default(false),
  }),
});

// Shorts are the small content type: one observation in three to five sentences,
// written straight into src/content/shorts by the write app's Publish button. They
// carry no hero image, no category kicker and no reading time, because at this
// length none of those say anything. The body is the piece; `description` is the
// same text as plain prose, for the card, the meta tag and the OG preview.
const shorts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/shorts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    // The thing the short comments on: a pull request, a release, a package.
    source: z.string().url().optional(),
    lang: z.enum(['en', 'de']).default('en'),
  }),
});

export const collections = { posts, shorts };
