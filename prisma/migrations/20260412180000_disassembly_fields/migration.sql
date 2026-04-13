-- AlterTable: add disassembly structured data columns to articles
ALTER TABLE "articles" ADD COLUMN "claim_map_json" TEXT;
ALTER TABLE "articles" ADD COLUMN "confidence_dashboard_json" TEXT;
ALTER TABLE "articles" ADD COLUMN "perspective_spectrum_json" TEXT;

-- AlterTable: add stakeholder and editorial framing to article_sources
ALTER TABLE "article_sources" ADD COLUMN "stakeholder_role" VARCHAR(64);
ALTER TABLE "article_sources" ADD COLUMN "editorial_frame" VARCHAR(256);
