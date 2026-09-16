import type { APIRoute } from 'astro';
import { getHomePosts, getSiteTopics, absoluteUrl, postPath, topicPath } from '../lib/content';

/*
 * Hand-rolled so posts get a real <lastmod> from front matter. Like the
 * original site: no paginated pages, no privacy policy, no 404, no priority
 * or changefreq.
 */
interface Entry {
  path: string;
  lastmod?: Date;
}

const escape = (value: string) => value.replace(/&/g, '&amp;');

export const GET: APIRoute = async () => {
  const [posts, topics] = await Promise.all([getHomePosts(), getSiteTopics()]);
  const newest = posts.reduce<Date | undefined>((latest, post) => {
    const changed = post.data.updated ?? post.data.date;
    return !latest || changed > latest ? changed : latest;
  }, undefined);

  const entries: Entry[] = [
    { path: '/', lastmod: newest },
    { path: '/about/' },
    { path: '/contact/' },
    ...topics.map((topic) => ({ path: topicPath(topic) })),
    ...posts.map((post) => ({ path: postPath(post), lastmod: post.data.updated ?? post.data.date })),
  ];

  const urls = entries
    .map(({ path, lastmod }) => {
      const loc = `<loc>${escape(absoluteUrl(path))}</loc>`;
      const mod = lastmod ? `<lastmod>${lastmod.toISOString()}</lastmod>` : '';
      return `  <url>${loc}${mod}</url>`;
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
