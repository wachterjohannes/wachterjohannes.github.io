import rss from '@astrojs/rss';
import { getSortedPosts } from '../../utils/posts';

// The writing feed: the main blog posts (regular, non-archived), newest first.
// This is the narrow feed for people who want the articles and not the shorts;
// /rss.xml carries both. context.site is the production origin from astro.config
// (johanneswachter.dev), so item links resolve to absolute URLs. Reachable at
// /blog/rss.xml.
export async function GET(context) {
  const posts = await getSortedPosts();
  return rss({
    title: 'Johannes Wachter · Writing',
    description:
      'Writing about what building open source actually teaches me, and what we can all learn from it.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
      categories: post.data.tags,
    })),
    customData: `<language>en</language>`,
  });
}
