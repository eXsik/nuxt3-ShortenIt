# ShortenIt

A URL shortener built with Nuxt 3, Vue 3, TypeScript, Tailwind CSS and Supabase.
Create a link, share it, and view its click activity.

[Public deployment](https://nuxt3-shorten-it.vercel.app/) — the latest local changes must be deployed before this URL reflects them.

## Features

- One-link guest demo at `/try`, with a browser-cookie limit.
- Email/password registration, login and logout.
- Custom short keys with URL validation and reserved-route protection.
- Authenticated Nitro endpoint for link creation; ownership comes from the verified session.
- HTTP 302 redirects handled by Nitro middleware.
- Dashboard listing a user's links and showing click counts and approximate locations.
- Responsive demo, authentication forms and dashboard layouts, plus visible keyboard focus.

## Implementation

The authenticated form calls `POST /api/links`. The server verifies the Supabase user,
validates the URL and key, and inserts using that user's database permissions.
A duplicate key returns HTTP 409. The guest endpoint, `POST /api/demo/shorten`,
uses a server-only service-role key and assigns no owner.

Requests to `/{key}` look up the destination and return HTTP 302. When an IP is
available, the middleware awaits a best-effort click insert with IP, approximate
GeoIP location and user-agent. A database trigger is expected to update the count.
The detail page requests only click timestamps and locations, not IPs or user-agents.
A failed tracking insert does not prevent the redirect.

## Local setup

Use **Node.js 24.16+** and Yarn Classic. Tests rely on Node's TypeScript stripping
and experimental VM modules; they do not require Vitest or Playwright.

```bash
cp .env.example .env
# Fill in your Supabase project values in .env.
yarn install --frozen-lockfile
yarn dev
```

Open `http://localhost:3000`. Environment variables:

- `SUPABASE_URL`: your Supabase project URL.
- `SUPABASE_KEY`: the legacy anon JWT key used by the Nuxt Supabase module.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only key for the guest endpoint. Never expose it through public runtime config or commit it.
- `APP_URL`: the application's origin, e.g. `http://localhost:3000`.

For a new Supabase project, the existing generated types describe the expected
`links` and `clicks` schema in `types/supabase.ts`. This repository does not yet
contain a complete database bootstrap migration. Recreating the database requires
its policies, unique key constraint, relationships and click-count trigger too.

If email confirmation is enabled, registration prompts the user to confirm their
email before signing in. Configure Supabase's Site URL and redirect allowlist for
your local and deployed origins. OAuth providers are not currently offered.

## Verification

```bash
yarn test       # isolated handler and form tests; no database writes
node --experimental-vm-modules tests/demo.test.mjs
node --experimental-vm-modules tests/links-api.test.mjs
node --experimental-vm-modules tests/link-form.test.mjs
node --experimental-vm-modules tests/auth.test.mjs
yarn build     # production bundle, not a full TypeScript typecheck
yarn preview   # serve the production output
```

The Node runner may show file-level results; running a test file directly displays
individual cases. Experimental Node warnings are expected. Tests execute the real
handler/form scripts with mocked Supabase and Nuxt globals. They cover validation,
session rejection, ownership spoofing, duplicate keys, cookie limits, redirects,
reserved routes and authentication outcomes. They do **not** verify live RLS,
browser rendering, real email delivery or the deployed click-count trigger.

GitHub Actions runs the tests and build on Node 24 with non-secret build values.
The workflow itself needs its first remote run after the changes are pushed.

## Database access and release checks

Run `database/audit.sql` in the **active** project's SQL editor. It only reads
policy, grant and constraint metadata. Review that:

- RLS is enabled on both tables.
- Link mutations enforce ownership, and click logs are readable only by their link owner.
- Link keys are unique.
- Direct database writes cannot bypass URL/key validation: enforce corresponding
  constraints or move writes behind a privileged endpoint and restrict direct mutations.
- The click-count trigger exists and behaves correctly.

**Current limitation:** moving the form to a server endpoint does not by itself
prevent a caller from using Supabase's REST API directly. Live policies and database
validation have not been verified by the local tests. Do not describe that boundary
as fully secured until it has been checked on the deployed project.

Before sharing the project with recruiters:

1. Register/sign in, create a custom link, open it, and confirm the count and log update.
2. Sign out and verify dashboard access is denied. With a second account, verify another user's detail/logs cannot be read.
3. Check `/try` on desktop and mobile: success, redirect, second-request limit and errors.
4. Review live RLS, then deploy the tested changes and repeat the smoke checks on the public URL.
5. Capture current desktop/mobile screenshots once the browser smoke checks pass.

## Deployment

Use the existing Vercel project. Set all four environment variables above for the
intended environment, with `APP_URL` matching its deployed origin. Keep the
service-role key server-only. Build with `yarn build` on Node 24.

A local successful build does not update Vercel. Confirm the deployment is ready
and test its public URL before adding it to your CV.

## Known limitations

- Cookie-only demo limit is a UX restriction, not protection against abuse; clearing
  the cookie or using another browser bypasses it. No IP rate limit is implemented.
- Click tracking is best effort; unavailable IPs or failed inserts are not counted.
  Counts are visits, not unique visitors. GeoIP location can be unavailable or inaccurate.
- Raw IPs and user-agents are still stored by the tracker. Review retention before wider use.
- No delete-link UI, OAuth, browser E2E suite or complete schema migration yet.
- Vue and Vue Router still use `latest` ranges; use the committed lockfile for installs.

## Project structure

```text
pages/                  Vue routes and dashboard
components/Forms/       Authentication and link forms
server/api/             Guest and authenticated link creation
server/middleware/      Short-link redirect and click tracking
middleware/             Dashboard/guest route guards
composables/            Link queries and UI helpers
tests/                  Node tests with isolated service mocks
database/audit.sql      Read-only database security metadata checks
```
