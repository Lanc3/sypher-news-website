-- CreateTable
CREATE TABLE "homepage_category_features" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "homepage_category_features_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "homepage_category_features_category_id_key" ON "homepage_category_features"("category_id");

-- CreateIndex
CREATE INDEX "homepage_category_features_position_idx" ON "homepage_category_features"("position");

-- AddForeignKey
ALTER TABLE "homepage_category_features"
ADD CONSTRAINT "homepage_category_features_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
