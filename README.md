# Sypher News Website

Next.js news frontend with Prisma (PostgreSQL), NextAuth admin, ingest API, AdSense-ready monetization, and cyberpunk UI.

## Product mission

Sypher News disassembles mainstream news coverage so readers can get the story with less bias, clearer sourcing, and more transparency.

## Environment variables

Copy [`.env.example`](./.env.example) and fill values. For **Vercel**, add the same keys in **Project → Settings → Environment Variables** (Production + Preview).

### Vercel: auth (do not skip)

Admin login **will not work** unless NextAuth can sign cookies. Set at least one secret and one public URL:

1. **`AUTH_SECRET`** (recommended) — or set **`NEXTAUTH_SECRET`** instead; the app copies it to `AUTH_SECRET` at boot. Generate locally:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. **`AUTH_URL`** (recommended) — e.g. `https://your-project.vercel.app`, or your custom domain with `https://`.  
   You may set **`NEXTAUTH_URL`** instead (same value).  
   If both are missing on Vercel, the app falls back to **`https://` + `VERCEL_URL`** (Vercel sets `VERCEL_URL` per deployment).

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | Postgres connection string (use **pooled** URL on serverless, e.g. Neon `?sslmode=require`). |
| `AUTH_SECRET` | Yes* | Long random string. *Or use `NEXTAUTH_SECRET` — mapped automatically. |
| `AUTH_URL` | Yes* | Canonical `https://…` site URL. *Or `NEXTAUTH_URL`, or rely on `VERCEL_URL` fallback on Vercel only. |
| `NEXTAUTH_URL` | Optional | Same as `AUTH_URL` if you prefer the legacy name. |
| `NEXTAUTH_SECRET` | Optional | Copied to `AUTH_SECRET` when `AUTH_SECRET` is unset. |
| `ARTICLES_INGEST_API_KEY` | For ingest | Required for `POST /api/v1/articles` to accept traffic. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Same public URL as `AUTH_URL` for metadata and JSON-LD. |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Optional | Public AdSense client ID, typically `ca-pub-...`. Slot-level client IDs can also be configured in admin. |
| `ADMIN_SEED_PASSWORD` | Seed only | Used when running `npm run db:seed` locally; not needed on Vercel runtime. |
| `UPSTASH_REDIS_*` | Required in production | Enables rate limits for ingest + analytics. Production traffic should not run without it. |
| `RESEND_API_KEY` | Optional | Enables newsletter audience sync with Resend. |
| `RESEND_AUDIENCE_ID` | Optional | Required with `RESEND_API_KEY` for newsletter sync. |

## Key product surfaces

- Public trust pages: `/about`, `/contact`, `/editorial-standards`, `/corrections`, `/privacy`, `/terms`
- Discovery: `/search`, curated homepage modules, category pages, related stories
- Article UX: visible breadcrumbs, bylines, transparency panel, share actions, corrections, revision notes
- Admin: dashboard, articles, authors, AdSense controls, analytics
- Crawlability: `robots.txt` and `sitemap.xml`

## Database: migrate and seed

**First time (local or against a hosted Postgres):**

```bash
# Apply migrations (creates all tables)
npx prisma migrate deploy

# Seed admin user, ad placement rows, optional demo article
npm run db:seed
```

Default admin after seed: **`admin@sypher.news`** / password **`changeme`** (or `ADMIN_SEED_PASSWORD` if you set it before seeding).

**Vercel:** the **build** runs `prisma migrate deploy` automatically. Run **seed once** from your computer pointed at production:

```bash
# Pull env (includes DATABASE_URL) — requires `npx vercel link` once
npx vercel env pull .env.local --environment=production --yes

# Seed using that file (also loads .env if present)
npm run db:seed:vercel
```

Or set `DATABASE_URL` manually, then `npm run db:seed`. Optional: `ADMIN_SEED_PASSWORD` before seeding to choose the admin password (default **`changeme`**).

Then sign in at `https://<your-domain>/admin/login` and change behavior via the admin UI.

## Monetization and consent

- Ad slots are managed from `/admin/ads`.
- Google AdSense script loading is gated by client-side consent.
- Disabled or misconfigured slots fall back safely instead of collapsing layout.

## Newsletter lifecycle

- Newsletter subscriptions are stored locally in Prisma.
- Each subscriber receives a unique unsubscribe token.
- If Resend Audience env vars are configured, subscribe and unsubscribe actions also sync to Resend.

## Deploy on Vercel

1. Push this repository to GitHub.
2. In [Vercel](https://vercel.com) → **Add New Project** → import the GitHub repo.
3. Set **Root Directory** to the repo root (default).
4. Add environment variables (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `ARTICLES_INGEST_API_KEY`, …).
5. Deploy. Ensure the Postgres database allows connections from Vercel (Neon: no IP allowlist issues; some providers need `0.0.0.0/0` or Vercel integration).

## GitHub

```bash
git init
git add .
git commit -m "Initial commit: Sypher News website"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

Create the empty repository on GitHub first, then use its URL as `origin`.
