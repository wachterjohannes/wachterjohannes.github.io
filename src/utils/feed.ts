// Feed readers open item links straight from the feed, so GoatCounter would file
// those visits as direct traffic. Tagging the link with utm_source=rss and
// utm_campaign=rss-<slug> makes them countable. The posts tag their own internal
// links with utm_campaign=<slug>, and GoatCounter lists campaigns by name only, so
// the rss- prefix keeps feed visits from merging with those clicks.
//
// The tagged URL is the item link only. The guid stays the clean permalink: it is
// the item's identity, and changing it would make every reader show the whole feed
// as unread. astro/rss derives guid from link and has no option for it, so it is
// overridden through customData, which is merged in after the guid is set.
//
// The link is passed absolute because astro/rss appends a trailing slash to relative
// links, which would land behind the query string.
const ORIGIN = 'https://johanneswachter.dev';

export function feedLink(path: string, slug: string) {
  return {
    link: `${ORIGIN}${path}?utm_source=rss&utm_campaign=rss-${slug}`,
    customData: `<guid isPermaLink="true">${ORIGIN}${path}</guid>`,
  };
}
