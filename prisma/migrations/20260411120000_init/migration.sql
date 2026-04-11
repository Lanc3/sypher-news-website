-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "AdSlot" AS ENUM ('header', 'sidebar', 'in_article');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'EDITOR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "name" VARCHAR(512) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "title" VARCHAR(1024) NOT NULL,
    "slug" VARCHAR(512) NOT NULL,
    "round_number" INTEGER NOT NULL DEFAULT 1,
    "status" VARCHAR(32) NOT NULL DEFAULT 'pending',
    "error_message" TEXT,
    "selection_rationale" TEXT,
    "research_markdown" TEXT,
    "query_log" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "author_styles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "system_prompt_fragment" TEXT NOT NULL,

    CONSTRAINT "author_styles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" SERIAL NOT NULL,
    "topic_id" INTEGER NOT NULL,
    "title" VARCHAR(1024) NOT NULL,
    "slug" VARCHAR(512) NOT NULL,
    "body_markdown" TEXT NOT NULL,
    "summary" TEXT,
    "author_style_id" INTEGER,
    "research_markdown" TEXT,
    "source_balance_summary" TEXT,
    "article_alignment_label" VARCHAR(64),
    "article_alignment_confidence" DOUBLE PRECISION,
    "article_alignment_rationale" TEXT,
    "seo_meta_title" VARCHAR(128),
    "seo_meta_description" TEXT,
    "seo_keywords" TEXT,
    "seo_og_title" VARCHAR(128),
    "seo_og_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_sources" (
    "id" SERIAL NOT NULL,
    "article_id" INTEGER NOT NULL,
    "url" VARCHAR(4096) NOT NULL,
    "title" VARCHAR(1024),
    "snippet" TEXT,
    "source_depth" INTEGER DEFAULT 0,
    "source_credibility_tier" VARCHAR(64),
    "fetch_error" TEXT,
    "alignment_axis" VARCHAR(64),
    "alignment_label" VARCHAR(64),
    "alignment_confidence" DOUBLE PRECISION,
    "alignment_rationale" TEXT,
    "alignment_assessed_at" TIMESTAMP(3),
    "alignment_model_version" VARCHAR(64),

    CONSTRAINT "article_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_placements" (
    "id" TEXT NOT NULL,
    "slot" "AdSlot" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "provider_key" VARCHAR(512),
    "ad_unit_path" VARCHAR(512),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_placements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_views" (
    "id" TEXT NOT NULL,
    "path" VARCHAR(2048) NOT NULL,
    "article_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_clicks" (
    "id" TEXT NOT NULL,
    "placement_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscribers" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "consent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "topics_slug_idx" ON "topics"("slug");

-- CreateIndex
CREATE INDEX "topics_category_id_idx" ON "topics"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "author_styles_name_key" ON "author_styles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "articles_topic_id_idx" ON "articles"("topic_id");

-- CreateIndex
CREATE INDEX "articles_created_at_idx" ON "articles"("created_at");

-- CreateIndex
CREATE INDEX "article_sources_article_id_idx" ON "article_sources"("article_id");

-- CreateIndex
CREATE UNIQUE INDEX "ad_placements_slot_key" ON "ad_placements"("slot");

-- CreateIndex
CREATE INDEX "page_views_created_at_idx" ON "page_views"("created_at");

-- CreateIndex
CREATE INDEX "page_views_article_id_idx" ON "page_views"("article_id");

-- CreateIndex
CREATE INDEX "ad_clicks_placement_id_idx" ON "ad_clicks"("placement_id");

-- CreateIndex
CREATE INDEX "ad_clicks_created_at_idx" ON "ad_clicks"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_style_id_fkey" FOREIGN KEY ("author_style_id") REFERENCES "author_styles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_sources" ADD CONSTRAINT "article_sources_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_clicks" ADD CONSTRAINT "ad_clicks_placement_id_fkey" FOREIGN KEY ("placement_id") REFERENCES "ad_placements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
