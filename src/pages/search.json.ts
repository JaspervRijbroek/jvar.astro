import type { APIRoute } from 'astro';
import {
  getAllPostsSorted,
  getPrimaryTopic,
  formatDate,
  estimateReadingMinutes,
  postPath,
} from '../lib/content';

/** Static index behind the header search dialog, newest first. */
export const GET: APIRoute = async () => {
  const posts = await getAllPostsSorted();

  const index = posts.map((post) => ({
    title: post.data.title,
    path: postPath(post),
    topic: getPrimaryTopic(post) ?? null,
    date: formatDate(post.data.date, 'long'),
    minutes: estimateReadingMinutes(post.body ?? ''),
  }));

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
