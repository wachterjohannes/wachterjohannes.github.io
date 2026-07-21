// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// Production domain. Canonical URLs + sitemap are built for this host even though
// the private stage is served at blog.eve.asapo.at. Assets are emitted with
// relative paths (default) so the same dist/ works under either origin.
export default defineConfig({
  site: 'https://johanneswachter.dev',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [mdx(), sitemap()],
});
