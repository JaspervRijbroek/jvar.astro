## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Environment variables

`UNSPLASH_ACCESS_KEY` and `PEXELS_API_KEY` are required by the `fetch-hero-images` integration (`integrations/fetch-hero-images.mjs`), which downloads post/topic hero images during both `astro dev` and `astro build`. See `.env.example`. Set them in a local `.env` for development; for production builds they must be set as Cloudflare Pages project environment variables, since `astro build` fails if they're missing.

`PUBLIC_GA_ID` (optional) is the Google Analytics 4 measurement ID (`G-P4D5XWQ2RY` for the live site). `src/layouts/Layout.astro` only emits the gtag snippet in production builds when it's set, so leave it empty locally and set it as a Cloudflare environment variable.

## SEO

The site URL is `site` in `astro.config.mjs`; everything absolute (canonical, Open Graph, sitemap, RSS, JSON-LD) derives from it via `SITE_URL`/`absoluteUrl()` in `src/lib/content.ts`. `src/layouts/Layout.astro` renders the whole SEO head from props — pages pass `canonical`, `image`, `schema`, etc. rather than writing `<meta>` tags themselves. Shared JSON-LD helpers live in `src/lib/seo.ts`; `sitemap.xml`, `rss.xml` and `robots.txt` are endpoints in `src/pages/`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
