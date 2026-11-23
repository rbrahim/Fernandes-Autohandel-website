# Fernandes Autohandel — website (demo)

Static HTML/CSS/JS website for Fernandes Autohandel N.V. (Paramaribo): Honda, GAC and Isuzu, split into two worlds, **Drive** (cars and SUVs) and **Work** (pick-up, trucks, ATV/UTV).

Built by Adept as a phase-1 demo. No build step, no framework.

## Pages

| File | Page |
|---|---|
| `index.html` | Homepage: Drive/Work switch with video reels, model rails, Fernandes, services, contact |
| `hr-v.html` | Honda HR-V model page |
| `d-max.html` | Isuzu D-Max model page (versions & prices comparison) |
| `aion-v.html` | GAC Aion V model page (EV: range, charging, savings calculator in SRD) |
| `used.html` | Used cars: faceted filters, sorting, shareable URLs, detail dialog. Data in `assets/data/used.js` |

## Structure

```
assets/
  css/      f-base.css (tokens, blocks), f-nav.css (nav + mega menu), f-model.css (model page template), ytbg.css
  js/       f-base.js (section paging, auto-hiding nav), f-nav.js (mega menu), f-model.js (model template), ytbg.js (background video)
  data/     models.js: the vehicle catalogue (one record per model) that feeds menus, reels and rails
  img/      photos from the current Fernandes website, per brand/model
  brochures/ model brochures (PDF) from the current Fernandes website
```

### Adding a model

1. Add or update its record in `assets/data/models.js` (set `page: 'model-id.html'` once the page exists).
2. Copy a model page (e.g. `hr-v.html`), change the content, the theme variables at the top (`--stone`, `--paint`) and the `FAHModel({...})` config: colours, versions, brochure, related models.

## Hosting

**Cloudflare (Workers with static assets):** build command *empty*, deploy command `npx wrangler deploy`. `wrangler.jsonc` serves the repository root as the site; `.assetsignore` keeps README and config files offline. The `name` in `wrangler.jsonc` must match the Worker name in Cloudflare. Every push to `main` deploys.

**Cloudflare Pages (alternative):** framework preset *None*, build command *empty*, build output directory `/`.

**Local (IIS):** the folder is served as `http://localhost/FAH/`. A local-only `web.config` (git-ignored) disables caching while developing.

## Notes

- Prices, rates and some D-Max version details are **demo values**, to be confirmed by Fernandes.
- Background videos are official right-hand-drive brand videos embedded from YouTube for the demo; the live site should use self-hosted files from the brands' dealer media portals.
- The photo of the Fernandes building is an older one (with VW branding); a new photo of the front with lights and flags is needed.
