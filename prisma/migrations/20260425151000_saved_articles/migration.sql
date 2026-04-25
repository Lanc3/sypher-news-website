-- CreateTable
CREATE TABLE "saved_articles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "article_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "saved_articles_user_id_article_id_key" ON "saved_articles"("user_id", "article_id");

-- CreateIndex
CREATE INDEX "saved_articles_user_id_created_at_idx" ON "saved_articles"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "saved_articles_article_id_idx" ON "saved_articles"("article_id");

-- AddForeignKey
ALTER TABLE "saved_articles" ADD CONSTRAINT "saved_articles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_articles" ADD CONSTRAINT "saved_articles_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
