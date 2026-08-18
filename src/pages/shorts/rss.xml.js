import rss from '@astrojs/rss';
import { getSortedShorts } from '../../utils/shorts';

// Shorts get their own feed rather than a place in /rss.xml. They publish more
// often and much lighter than the articles, so mixing them in would change what
// the main feed is for; a separate feed lets people take the long-form only, the
// shorts only, or both. Reachable at /shorts/rss.xml.
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
