import rss from '@astrojs/rss';
import { getSortedPosts } from '../utils/posts';

// RSS 2.0 feed of the main blog posts (regular, non-archived), newest first.
// context.site is the production origin from astro.config (johanneswachter.dev),
// so item links resolve to absolute URLs. Reachable at /rss.xml.
export async function GET(context) {
  const posts = await getSortedPosts();
  return rss({
    title: 'Johannes Wachter',
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
