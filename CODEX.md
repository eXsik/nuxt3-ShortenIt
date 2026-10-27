# ShortenIt — agent brief

## Product
Nuxt 3 URL shortener (Vue 3, Tailwind, Supabase). Portfolio for Frontend Developer roles
(Nuxt, TypeScript, SSR, performance/SEO, Vitest/Playwright, a11y).

## Live / infra (do not recreate unless broken)
- Supabase project: **nuxt3-ShortenIt-v2** (`aqvqiwmcthljqzyhclmk`) — ACTIVE
- Old project `nuxt3-ShortenIt` is PAUSED forever — ignore
- Tables: `links`, `clicks` + RLS + total_clicks trigger — already applied
- Local `.env`: SUPABASE_URL, SUPABASE_KEY (anon), APP_URL
- Vercel: `nuxt3-shorten-it` — env pointed at v2, Node 24.x, production redeployed
- Auth: email works; **Confirm email OFF** (`mailer_autoconfirm=true`)
- GitHub OAuth: NOT configured (UI button exists but provider disabled) — defer
- Google OAuth: later, not now

## Hard rules (Qba)
- Reply in Polish; code/commits/identifiers in English
- Do NOT push, install deps, change .env, DB schema, or Vercel without explicit approval
- Default: propose plan first; implement only on "zrób / zaimplementuj / napraw"
- Smallest change that solves the task; no rewrites
- Mobile tap UX: hover only in `@media (hover: hover)`; `touch-action: manipulation` on controls

## Known tech debt (from audit — do not invent more)
1. `pages/[id].vue`: debug `{{ params }}`, fixed `useAsyncData("link")` key, geoip in page (move to Nitro)
2. `dashboard/[id]`: missing auth middleware + ownership filter; clicks expose IPs
3. No server/api routes; empty server/ besides tsconfig
4. LinkForm: no URL validation; errors only in console
5. No Vitest/Playwright
6. README outdated (claims delete; weak setup docs)
7. package.json: `vue`/`vue-router` = "latest"

## Priority order (recruitment ROI)
1. Smoke: register → shorten → open short URL (local + https://nuxt3-shorten-it.vercel.app)
2. Nitro SSR redirect + click tracking (remove geoip from Vue page)
3. Authz on dashboard detail + safer click log UI
4. URL validation + form error UX
5. Optional: demo mode (1 link without account)
6. Minimal Vitest + Playwright
7. README honesty + setup
8. Visual redesign (premium, non-AI) — AFTER core flows work OR as isolated UI pass

## Design direction IF redesigning
Goal: premium utility tool for people who share links professionally — NOT generic AI SaaS.
Avoid: purple gradients, glow, Inter/Roboto, cream+terracotta+serif AI kit, identical card grids,
all-caps eyebrows, neon accents on near-black, glassmorphism soup.
Prefer: strong brand wordmark as hero signal; one type pairing with character; restrained palette
(ink / paper / one sharp accent); full-bleed or atmospheric background with real texture/gradient discipline;
motion: 2–3 intentional moments max; first viewport = brand + one line + one CTA (no stats strip).
Keep Tailwind; evolve tokens/CSS variables rather than new UI kit.
Respect existing Nuxt component structure.

## Out of scope for now
Password one-time secrets, Google OAuth, large analytics rewrite, Pinia, full redesign systems.
