# Sypher News Website

Next.js news frontend with Prisma (PostgreSQL), NextAuth admin, ingest API, and cyberpunk UI.

## Environment variables

Copy [`.env.example`](./.env.example) and fill values. For **Vercel**, add the same keys in **Project → Settings → Environment Variables** (Production + Preview).

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | Postgres connection string (use **pooled** URL on serverless, e.g. Neon `?sslmode=require`). |
| `AUTH_SECRET` | Yes | Long random string. NextAuth v5 uses this (alias `NEXTAUTH_SECRET` also works). |
| `AUTH_URL` | Yes on Vercel | Canonical site URL, e.g. `https://your-project.vercel.app` (avoids auth callback issues). |
| `NEXTAUTH_URL` | Optional | Same as `AUTH_URL` if you prefer the legacy name. |
| `ARTICLES_INGEST_API_KEY` | For ingest | Required for `POST /api/v1/articles` to accept traffic. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Same public URL as `AUTH_URL` for metadata and JSON-LD. |
| `ADMIN_SEED_PASSWORD` | Seed only | Used when running `npm run db:seed` locally; not needed on Vercel runtime. |
| `UPSTASH_REDIS_*` | Optional | Enables rate limits for ingest + analytics. |

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
set DATABASE_URL=postgresql://...   # Windows PowerShell: $env:DATABASE_URL="..."
set ADMIN_SEED_PASSWORD=your-secure-password
npm run db:seed
```

Then sign in at `https://<your-domain>/admin/login` and change behavior via the admin UI.

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
