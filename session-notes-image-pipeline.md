# Session Notes — Image Pipeline for Sypher News
**Date:** 2026-04-23

## Context
- `sypher-news` = AI article generator (backend pipeline)
- `SypherNewsWebsite` = frontend that displays articles
- Current problem: 0 images for article cards or article headers

## Proposed Solution: Auto-Image Fetching During Research Phase

### How It Works

**1. Finding the Image**
- Hook into the research phase of the sypher-news pipeline, before the article is written
- After topic/keywords are identified, call a free stock photo API:
  - [Unsplash API](https://unsplash.com/developers) — free tier, search by keyword
  - [Pexels API](https://www.pexels.com/api/) — free tier, search by keyword
- Pass 1–2 of the most relevant topic keywords (e.g. "artificial intelligence chip" or "federal reserve interest rates")
- Pick the top result, optionally filtering for landscape orientation (works for both cards and headers)

**Alternative:** Call an image generation API (Together AI, Replicate + diffusion model) with a prompt derived from the article headline — more tailored but slower and costlier than stock photos.

**2. Storing the Reference**
- Save the image URL as an extra field in the same JSON/DB record as the article
  - Suggested field name: `cover_image_url`
  - Optionally also store a `cover_image_thumbnail_url` (Unsplash/Pexels return this too)
- No need to store image data — just the link
- Optional: download and re-host to your own storage (S3, Cloudflare R2) for resilience

**3. Serving on the Website**
- Article card component reads `cover_image_url` for the thumbnail
- Article page reads the same field for the full-width hero/header image
- If the field is missing → fall back to a placeholder (old articles degrade gracefully)

## Summary
The addition to sypher-news is minimal:
1. One API call after keyword extraction
2. One extra field written to the article record

No changes needed to the data fetching layer on the website side — the image URL just rides along in the existing article payload.
