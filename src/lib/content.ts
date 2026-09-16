import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;
export type Topic = CollectionEntry<'topics'>;

export const SITE_URL = 'https://jvar.nl';
export const SITE_TITLE = 'Jvar';
export const AUTHOR_NAME = 'Jasper van Rijbroek';

/** Posts per listing page, matching the original site. */
export const POSTS_PER_PAGE = 6;

/** Topics that are plumbing rather than sections readers browse. */
const HIDDEN_TOPICS = ['archive', 'website'];

/*
 * Most posts also carry the catch-all "Everything Spain" topic, so cards show
 * the most specific one instead of whatever happens to come first.
 */
const GENERIC_TOPICS = ['Everything Spain', 'Archive'];

export async function getAllTopics() {
  return getCollection('topics');
}

export async function getSiteTopics() {
  const all = await getAllTopics();
  return all
    .filter((t) => !HIDDEN_TOPICS.includes(t.data.slug))
    .sort((a, b) => a.data.title.localeCompare(b.data.title));
}

export async function getNavTopics() {
  const order = ['essentials', 'places', 'everything-spain'];
  const all = await getSiteTopics();
  return order
    .map((slug) => all.find((t) => t.data.slug === slug))
    .filter((t): t is Topic => Boolean(t));
}

export async function getTopicBySlug(slug: string) {
  const all = await getAllTopics();
  return all.find((t) => t.data.slug === slug);
}

export async function getTopicTitleToSlugMap() {
  const all = await getAllTopics();
  return new Map(all.map((t) => [t.data.title, t.data.slug]));
}

export async function getAllPostsSorted() {
  const posts = await getCollection('posts');
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Everything except the archive: what the home page and `/page/N/` list. */
export async function getHomePosts() {
  const posts = await getAllPostsSorted();
  return posts.filter((p) => !p.data.topics.includes('Archive'));
}

export async function getPostsByTopicTitle(title: string) {
  const posts = await getAllPostsSorted();
  return posts.filter((p) => p.data.topics.includes(title));
}

/** The most specific topic on a post, for card meta lines and chips. */
export function getPrimaryTopic(post: Post): string | undefined {
  const topics = post.data.topics;
  return topics.find((t) => !GENERIC_TOPICS.includes(t)) ?? topics[0];
}

/** Explicitly linked related posts only, like the original site. */
export async function getRelatedPosts(post: Post) {
  if (post.data.relatedPosts.length === 0) return [];
  const all = await getAllPostsSorted();
  const bySlug = new Map(all.map((p) => [p.data.slug, p]));
  return post.data.relatedPosts.map((slug) => bySlug.get(slug)).filter((p): p is Post => Boolean(p));
}

export function postPath(post: Post) {
  return `/blog/${post.data.slug}/`;
}

export function topicPath(topic: Topic | string) {
  const slug = typeof topic === 'string' ? topic : topic.data.slug;
  return `/topic/${slug}/`;
}

export function pageCount(total: number) {
  return Math.ceil(total / POSTS_PER_PAGE);
}

export function paginate<T>(items: T[], page: number) {
  const start = (page - 1) * POSTS_PER_PAGE;
  return items.slice(start, start + POSTS_PER_PAGE);
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Date formats used across the site, named after the moment tokens the
 * original used: `short` = "DD MMM", `long` = "MMMM DD, YYYY",
 * `month` = "MMM YYYY".
 */
export function formatDate(date: Date, style: 'short' | 'long' | 'month' = 'short') {
  const month = MONTHS[date.getUTCMonth()];
  const day = pad(date.getUTCDate());
  const year = date.getUTCFullYear();

  if (style === 'long') return `${month} ${day}, ${year}`;
  if (style === 'month') return `${month.slice(0, 3)} ${year}`;
  return `${day} ${month.slice(0, 3)}`;
}

/** Same maths as gatsby-transformer-remark's `timeToRead`. */
export function estimateReadingMinutes(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 265));
}
