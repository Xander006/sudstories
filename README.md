# Sud Stories

Static podcast landing page for GitHub Pages / Cloudflare Pages.

## Add a new episode

Run:

```bash
node scripts/add-episode.js
```

The script updates `content.json`, which is the single source of truth for:

- the episode cards on the page
- the featured episode block
- the platform links
- the JSON-LD structured data

After the script runs, review `content.json`, commit, and deploy.

## Content model

- `site`: global podcast metadata and platform links
- `episodes`: newest episode first

If you add episodes manually, keep `episodes` ordered from newest to oldest.
