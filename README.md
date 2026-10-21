# ShortenIt

URL shortener built with **Nuxt 3**, **Vue 3**, **Tailwind CSS**, and **Supabase**.

Live demo: https://nuxt3-shorten-it.vercel.app/

## Features

- Create short, shareable links (http/https validation)
- Dashboard to list links and view click stats
- Server-side redirect (Nitro middleware) with click tracking (IP / geo / user-agent)
- Email/password auth via Supabase (GitHub OAuth UI exists but is not configured on the current project)

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Nuxt 3 (SSR by default) |
| UI | Vue 3 + Tailwind CSS |
| Backend / Auth / DB | Supabase |
| Hosting | Vercel |

## Local setup

### 1. Prerequisites

- Node.js 20+ (Vercel project uses **24.x**)
- Yarn (lockfile is `yarn.lock`)
- A Supabase project with tables `links` and `clicks` + RLS (see below)

### 2. Environment

Copy `.env.example` to `.env` and fill values:

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_KEY=YOUR_ANON_KEY
APP_URL=http://localhost:3000
```

- `SUPABASE_KEY` must be the **legacy anon JWT** key (works with `@nuxtjs/supabase`).
- `APP_URL` is used when copying short links in the dashboard.

### 3. Install & run

```bash
yarn install
yarn dev
```

App: http://localhost:3000

### 4. Auth notes

- Email signup should work with **Confirm email disabled** (autoconfirm) for local/demo use.
- After signup, open **Dashboard** → paste a long URL → **Short It**.
- Opening `/{shortKey}` triggers Nitro middleware: log click → HTTP 302 to `long_url`.

## Database (current project)

Expected public tables:

- `links` — `key` (unique), `long_url`, `user_id`, `total_clicks`, `created_at`
- `clicks` — `link_id`, `ip`, `country`, `city`, `user_agent`, `created_at`

RLS (high level):

- Links are readable publicly (needed for redirects); insert/update/delete only for the owner
- Clicks: anyone can insert; only the link owner can read logs
- Trigger increments `links.total_clicks` on each click insert

## Project structure (relevant)

```
pages/                  # Vue routes (landing, auth, dashboard)
server/middleware/      # Short-link SSR redirect + tracking
composables/            # useLinks, useLinkByKey, helpers
components/             # UI + forms
types/supabase.ts       # Generated-style DB types
middleware/auth.ts      # Protects dashboard routes
```

## Scripts

```bash
yarn dev       # development server
yarn build     # production build
yarn preview   # preview production build
```

## Deploy (Vercel)

Set the same env vars for Production / Preview:

- `SUPABASE_URL`
- `SUPABASE_KEY`
- `APP_URL` = `https://nuxt3-shorten-it.vercel.app` (or your custom domain)

In Supabase **Authentication → URL Configuration**, allow:

- `http://localhost:3000/**`
- `https://nuxt3-shorten-it.vercel.app/**`

## Known limitations (honest MVP)

- No delete-link UI yet (list + detail + stats only)
- No Vitest / Playwright suite yet
- GitHub / Google OAuth not wired on the active Supabase project
- Public `SELECT` on `links` matches the current client/server redirect design; tighten later if you move fully to service-role redirects

## License

Private / portfolio project.
