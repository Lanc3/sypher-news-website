-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "NewsletterStatus" AS ENUM ('ACTIVE', 'PENDING', 'UNSUBSCRIBED');

-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM (
    'PAGE_VIEW',
    'SHARE',
    'NEWSLETTER_SUBMIT',
    'AD_CLICK',
    'SEARCH',
    'RELATED_CLICK',
    'ADSENSE_RENDER',
    'ADSENSE_BLOCKED'
);

-- AlterTable
ALTER TABLE "articles"
ADD COLUMN "status" "ArticleStatus" NOT NULL DEFAULT 'PUBLISHED',
ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "published_at" TIMESTAMP(3),
ADD COLUMN "scheduled_for" TIMESTAMP(3),
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "articles"
SET "published_at" = "created_at"
WHERE "published_at" IS NULL;

-- AlterTable
ALTER TABLE "ad_placements"
ADD COLUMN "ad_client" VARCHAR(255),
ADD COLUMN "slot_id" VARCHAR(255),
ADD COLUMN "format" VARCHAR(64),
ADD COLUMN "layout_key" VARCHAR(255),
ADD COLUMN "target_path" VARCHAR(512),
ADD COLUMN "notes" TEXT,
ADD COLUMN "style" JSONB;

-- AlterTable
ALTER TABLE "newsletter_subscribers"
ADD COLUMN "status" "NewsletterStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "source" VARCHAR(64),
ADD COLUMN "provider_id" VARCHAR(255),
ADD COLUMN "provider_status" VARCHAR(64),
ADD COLUMN "unsubscribe_token" VARCHAR(255),
ADD COLUMN "last_confirmed_at" TIMESTAMP(3),
ADD COLUMN "unsubscribed_at" TIMESTAMP(3),
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "newsletter_subscribers"
SET "unsubscribe_token" = md5("email" || random()::text || clock_timestamp()::text)
WHERE "unsubscribe_token" IS NULL;

ALTER TABLE "newsletter_subscribers"
ALTER COLUMN "unsubscribe_token" SET NOT NULL;

-- CreateTable
CREATE TABLE "authors" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255),
    "bio" TEXT,
    "avatar_url" VARCHAR(2048),
    "social_links" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_authors" (
    "article_id" INTEGER NOT NULL,
    "author_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "article_authors_pkey" PRIMARY KEY ("article_id","author_id")
);

-- CreateTable
CREATE TABLE "article_revisions" (
    "id" TEXT NOT NULL,
    "article_id" INTEGER NOT NULL,
    "editor_id" TEXT,
    "summary" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "correction_notices" (
    "id" TEXT NOT NULL,
    "article_id" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "correction_notices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "type" "AnalyticsEventType" NOT NULL,
    "path" VARCHAR(2048),
    "article_id" INTEGER,
    "placement_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "authors_slug_key" ON "authors"("slug");

-- CreateIndex
CREATE INDEX "article_authors_author_id_position_idx" ON "article_authors"("author_id", "position");

-- CreateIndex
CREATE INDEX "article_revisions_article_id_created_at_idx" ON "article_revisions"("article_id", "created_at");

-- CreateIndex
CREATE INDEX "correction_notices_article_id_created_at_idx" ON "correction_notices"("article_id", "created_at");

-- CreateIndex
CREATE INDEX "analytics_events_type_created_at_idx" ON "analytics_events"("type", "created_at");

-- CreateIndex
CREATE INDEX "analytics_events_article_id_created_at_idx" ON "analytics_events"("article_id", "created_at");

-- CreateIndex
CREATE INDEX "analytics_events_placement_id_created_at_idx" ON "analytics_events"("placement_id", "created_at");

-- CreateIndex
CREATE INDEX "articles_status_created_at_idx" ON "articles"("status", "created_at");

-- CreateIndex
CREATE INDEX "articles_featured_created_at_idx" ON "articles"("featured", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_unsubscribe_token_key" ON "newsletter_subscribers"("unsubscribe_token");

-- AddForeignKey
ALTER TABLE "article_authors"
ADD CONSTRAINT "article_authors_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_authors"
ADD CONSTRAINT "article_authors_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "authors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_revisions"
ADD CONSTRAINT "article_revisions_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_revisions"
ADD CONSTRAINT "article_revisions_editor_id_fkey" FOREIGN KEY ("editor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "correction_notices"
ADD CONSTRAINT "correction_notices_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events"
ADD CONSTRAINT "analytics_events_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events"
ADD CONSTRAINT "analytics_events_placement_id_fkey" FOREIGN KEY ("placement_id") REFERENCES "ad_placements"("id") ON DELETE SET NULL ON UPDATE CASCADE;
