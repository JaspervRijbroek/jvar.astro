import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import { getPostHeroImage } from './images';
import { type Post, SITE_URL, SITE_TITLE, AUTHOR_NAME, absoluteUrl, postPath } from './content';

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** Absolute URL of a 1200×630 JPEG rendition, the size social cards expect. */
export async function ogImageUrl(image: ImageMetadata) {
  const rendered = await getImage({
    src: image,
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    format: 'jpg',
  });
  return absoluteUrl(rendered.src);
}

/** The site author, referenced by `@id` from every BlogPosting. */
export function personRef() {
  return {
    '@type': 'Person',
    '@id': `${SITE_URL}/about/#Person`,
    name: AUTHOR_NAME,
    url: `${SITE_URL}/about/`,
  };
}

export function publisher() {
  return {
    '@type': 'Organization',
    '@id': SITE_URL,
    name: SITE_TITLE,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/icons/icon-512x512.png`,
      width: 512,
      height: 512,
    },
  };
}

interface BlogListOptions {
  name: string;
  url: string;
  description: string;
}

/** `Blog` schema for a listing page, with the posts shown on it. */
export async function blogListSchema(posts: Post[], { name, url, description }: BlogListOptions) {
  const blogPost = await Promise.all(
    posts.map(async (post) => {
      const hero = getPostHeroImage(post.data.slug);
      return {
        '@type': 'BlogPosting',
        headline: post.data.title,
        url: absoluteUrl(postPath(post)),
        datePublished: post.data.date.toISOString(),
        dateModified: (post.data.updated ?? post.data.date).toISOString(),
        description: post.data.teaser,
        author: { '@type': 'Person', name: AUTHOR_NAME },
        publisher: { '@type': 'Organization', name: SITE_TITLE },
        ...(hero && { image: [await ogImageUrl(hero)] }),
      };
    }),
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name,
    url,
    description,
    isFamilyFriendly: true,
    copyrightHolder: AUTHOR_NAME,
    blogPost,
  };
}
