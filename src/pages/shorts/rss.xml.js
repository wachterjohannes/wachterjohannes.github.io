import rss from '@astrojs/rss';
import { getSortedShorts } from '../../utils/shorts';

// The shorts feed: shorts and nothing else, for people who want the small pieces
// without the articles. /rss.xml carries both and /blog/rss.xml carries the writing
// on its own. Reachable at /shorts/rss.xml.
export async function GET(context) {
  const shorts = await getSortedShorts();
  return rss({
    title: 'Johannes Wachter · Shorts',
    description: 'Short notes on Symfony, open source and agentic development. One observation at a time.',
    site: context.site,
    items: shorts.map((short) => ({
      title: short.data.title,
      description: short.data.description,
      pubDate: short.data.pubDate,
      link: `/shorts/${short.id}/`,
      categories: short.data.tags,
    })),
    customData: `<language>en</language>`,
  });
}
