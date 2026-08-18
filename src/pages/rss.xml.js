import rss from '@astrojs/rss';
import { getSortedPosts } from '../utils/posts';
import { getSortedShorts } from '../utils/shorts';

// The everything feed: articles and shorts in one stream, newest first. It is the
// feed the site advertises first, and the two narrower ones sit next to it for
// people who want one kind and not the other:
//
//   /rss.xml         everything
//   /blog/rss.xml    the writing
//   /shorts/rss.xml  the shorts
//
// context.site is the production origin from astro.config (johanneswachter.dev),
// so item links resolve to absolute URLs.
export async function GET(context) {
  const [posts, shorts] = await Promise.all([getSortedPosts(), getSortedShorts()]);

  const items = [
    ...posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
      categories: post.data.tags,
    })),
    ...shorts.map((short) => ({
      title: short.data.title,
      description: short.data.description,
      pubDate: short.data.pubDate,
      link: `/shorts/${short.id}/`,
      categories: short.data.tags,
    })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: 'Johannes Wachter · Everything',
    description: 'Everything in one feed: the writing and the shorts, newest first.',
    site: context.site,
    items,
    customData: `<language>en</language>`,
  });
}
