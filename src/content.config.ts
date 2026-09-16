import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    teaser: z.string().optional(),
    seoDescription: z.string().optional(),
    topics: z.array(z.string()).default([]),
    image: z.string().optional(),
    relatedPosts: z.array(z.string()).default([]),
  }),
});

const topics = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/topics' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    image: z.string().optional(),
  }),
});

export const collections = { posts, topics };
