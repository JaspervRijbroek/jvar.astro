## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Environment variables

`UNSPLASH_ACCESS_KEY` and `PEXELS_API_KEY` are required by the `fetch-hero-images` integration (`integrations/fetch-hero-images.mjs`), which downloads post/topic hero images during both `astro dev` and `astro build`. See `.env.example`. Set them in a local `.env` for development; for production builds they must be set as Cloudflare Pages project environment variables, since `astro build` fails if they're missing.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
