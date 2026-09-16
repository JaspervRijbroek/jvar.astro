import { readdirSync, readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

try {
  process.loadEnvFile();
} catch {
  // .env is optional if the vars are already in the environment
}

const CONTENT_TYPE_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readFrontmatterField(filePath, field) {
  const content = readFileSync(filePath, 'utf-8');
  const match = content.match(new RegExp(`^${field}: (.*)$`, 'm'));
  if (!match) return undefined;
  try {
    return JSON.parse(match[1]);
  } catch {
    return undefined;
  }
}

function alreadyDownloaded(dir, slug) {
  if (!existsSync(dir)) return false;
  return readdirSync(dir).some((f) => f.startsWith(`${slug}.`));
}

async function resolveImageUrl(imageId) {
  if (imageId.startsWith('pexels:')) {
    const id = imageId.slice('pexels:'.length);
    const res = await fetch(`https://api.pexels.com/v1/photos/${id}`, {
      headers: { Authorization: process.env.PEXELS_API_KEY },
    });
    if (!res.ok) throw new Error(`Pexels API ${res.status} for id ${id}`);
    const data = await res.json();

    const url = data?.src?.original || data?.src?.large2x || data?.src?.large;
    if (!url) throw new Error(`No Pexels image URL for id ${id}`);
    return url;
  }

  const res = await fetch(`https://api.unsplash.com/photos/${imageId}`, {
    headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
  });
  if (!res.ok) throw new Error(`Unsplash API ${res.status} for id ${imageId}`);
  const data = await res.json();
  const url = data?.urls?.raw || data?.urls?.full || data?.urls?.regular;
  if (!url) throw new Error(`No Unsplash image URL for id ${imageId}`);
  return url;
}

async function downloadImage(url, dir, slug) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed (${res.status}) for ${url}`);
  const contentType = res.headers.get('content-type')?.split(';')[0];
  const ext = CONTENT_TYPE_EXT[contentType] || 'jpg';
  const buffer = Buffer.from(await res.arrayBuffer());
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${slug}.${ext}`), buffer);
}

async function processEntry(slug, imageId, outDir, logger) {
  if (alreadyDownloaded(outDir, slug)) {
    logger.debug(`skip (already downloaded): ${slug}`);
    return 'skipped';
  }
  try {
    const url = await resolveImageUrl(imageId);
    await downloadImage(url, outDir, slug);
    logger.info(`downloaded: ${slug}`);
    return 'downloaded';
  } catch (err) {
    logger.warn(`FAILED: ${slug} (${imageId}) — ${err.message}`);
    return 'failed';
  }
}

export async function fetchHeroImages({ root, logger, strict }) {
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  const pexelsKey = process.env.PEXELS_API_KEY;

  if (!unsplashKey || !pexelsKey) {
    const message =
      'Missing UNSPLASH_ACCESS_KEY or PEXELS_API_KEY (set them in .env locally, ' +
      'or as Cloudflare Pages project environment variables for production builds)';
    if (strict) throw new Error(message);
    logger.warn(`${message} — skipping hero image fetch for this dev session.`);
    return;
  }

  const POSTS_DIR = join(root, 'src/content/posts');
  const TOPICS_DIR = join(root, 'src/content/topics');
  const HERO_DIR = join(root, 'src/assets/hero');

  const postFiles = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
  const topicFiles = readdirSync(TOPICS_DIR)
    .filter((f) => f.endsWith('.md'))
    .filter((f) => f !== 'archive.md'); // archive topic has no page on the site

  const counts = { downloaded: 0, skipped: 0, failed: 0 };

  for (const file of postFiles) {
    const filePath = join(POSTS_DIR, file);
    const slug = readFrontmatterField(filePath, 'slug');
    const image = readFrontmatterField(filePath, 'image');
    if (!slug || !image) continue;
    const result = await processEntry(slug, image, join(HERO_DIR, 'posts'), logger);
    counts[result]++;
    if (result !== 'skipped') await sleep(250);
  }

  for (const file of topicFiles) {
    const filePath = join(TOPICS_DIR, file);
    const slug = readFrontmatterField(filePath, 'slug');
    const image = readFrontmatterField(filePath, 'image');
    if (!slug || !image) continue;
    const result = await processEntry(slug, image, join(HERO_DIR, 'topics'), logger);
    counts[result]++;
    if (result !== 'skipped') await sleep(250);
  }

  logger.info(`Done. Downloaded: ${counts.downloaded}, skipped (cached): ${counts.skipped}, failed: ${counts.failed}`);
}

export default function fetchHeroImagesIntegration() {
  let root;
  return {
    name: 'fetch-hero-images',
    hooks: {
      'astro:config:setup': ({ config }) => {
        root = fileURLToPath(config.root);
      },
      'astro:build:start': async ({ logger }) => {
        await fetchHeroImages({ root, logger, strict: true });
      },
      'astro:server:setup': async ({ logger }) => {
        try {
          await fetchHeroImages({ root, logger, strict: false });
        } catch (err) {
          logger.error(
            `Hero image fetch failed unexpectedly, continuing dev server startup: ${
              err instanceof Error ? err.message : String(err)
            }`
          );
        }
      },
    },
  };
}
