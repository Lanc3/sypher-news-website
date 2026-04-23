-- AlterTable: add cover image columns to articles (both nullable; existing rows stay NULL)
ALTER TABLE "articles" ADD COLUMN "cover_image_url" VARCHAR(2048);
ALTER TABLE "articles" ADD COLUMN "cover_image_thumbnail_url" VARCHAR(2048);
