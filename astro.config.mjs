// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { readdirSync, readFileSync } from 'node:fs';

// Posts that must not be in the sitemap: unlisted ones (live but deliberately not linked) and
// cross-posts whose canonical URL points to the original elsewhere. A sitemap should only
// list canonical pages of this site; listing a page whose canonical is another domain is a
// contradiction search engines report as an error.
const postsDir = new URL('./src/content/posts/', import.meta.url);
const excludedPaths = new Set(
  readdirSync(postsDir)
    .filter((file) => /\.mdx?$/.test(file))
    .filter((file) => {
      const frontmatter = readFileSync(new URL(file, postsDir), 'utf8').split(/^---$/m)[1] ?? '';
      return /^unlisted:\s*true\s*$/m.test(frontmatter) || /^canonicalUrl:/m.test(frontmatter);
    })
    .map((file) => `/blog/${file.replace(/\.mdx?$/, '')}/`),
);

// Production domain. Canonical URLs + sitemap are built for this host even though
// the private stage is served at blog.eve.asapo.at. Assets are emitted with
// relative paths (default) so the same dist/ works under either origin.
export default defineConfig({
  site: 'https://johanneswachter.dev',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [
    mdx(),
    sitemap({ filter: (page) => !excludedPaths.has(new URL(page).pathname) }),
  ],
});
