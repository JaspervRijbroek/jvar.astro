import type { ImageMetadata } from 'astro';

const postImages = import.meta.glob<{ default: ImageMetadata }>('/src/assets/hero/posts/*', {
  eager: true,
});
const topicImages = import.meta.glob<{ default: ImageMetadata }>('/src/assets/hero/topics/*', {
  eager: true,
});

function lookup(map: Record<string, { default: ImageMetadata }>, slug: string) {
  const entry = Object.entries(map).find(([path]) => path.match(new RegExp(`/${slug}\\.[a-z]+$`)));
  return entry?.[1]?.default;
}

export function getPostHeroImage(slug: string): ImageMetadata | undefined {
  return lookup(postImages, slug);
}

export function getTopicHeroImage(slug: string): ImageMetadata | undefined {
  return lookup(topicImages, slug);
}
