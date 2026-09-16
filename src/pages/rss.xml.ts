import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getHomePosts, postPath, SITE_TITLE, SITE_DESCRIPTION } from '../lib/content';

export const GET: APIRoute = async (context) => {
  const posts = await getHomePosts();

  return rss({
    title: `${SITE_TITLE} RSS Feed`,
    description: SITE_DESCRIPTION,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.teaser,
      pubDate: post.data.date,
      link: postPath(post),
    })),
  });
};
